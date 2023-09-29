import { useCallback, useEffect, useState } from "react";
import { ChainId } from "@certusone/wormhole-sdk";

import { useEnvironment } from "src/context/EnvironmentContext";
import { txType } from "src/consts";
import { Alert, Loader } from "src/components/atoms";
import { useLocalStorage } from "src/utils/hooks/useLocalStorage";
import { formatUnits, parseAddress, parseTx } from "src/utils/crypto";
import { formatDate } from "src/utils/date";
import { formatCurrency } from "src/utils/number";
import {
  DeliveryLifecycleRecord,
  populateDeliveryLifecycleRecordByVaa,
} from "src/utils/genericRelayerVaaUtils";
import { GetTransactionsOutput } from "src/api/search/types";
import { VAADetail } from "src/api/guardian-network/types";

import Tabs from "./Tabs";
import Summary from "./Summary";
import Overview from "./Overview/index";
import Details from "./Details";
import RawData from "./RawData";
import RelayerOverview from "./RelayerOverview";

import "./styles.scss";

interface Props {
  extraRawInfo: any;
  VAAData: VAADetail & { vaa: any; decodedVaa: any };
  txData: GetTransactionsOutput;
}

const UNKNOWN_APP_ID = "UNKNOWN";

const Information = ({ extraRawInfo, VAAData, txData }: Props) => {
  const [showOverview, setShowOverview] = useState(true);
  const [showOverviewDetail, setShowOverviewDetail] = useLocalStorage<boolean>(
    "showOverviewDetail",
    false,
  );
  const { environment } = useEnvironment();
  const currentNetwork = environment.network;

  const totalGuardiansNeeded = currentNetwork === "MAINNET" ? 13 : 1;
  const { decodedVaa, vaa } = VAAData || {};
  const { guardianSignatures } = decodedVaa || {};
  const guardianSignaturesCount = guardianSignatures?.length || 0;
  const hasVAA = !vaa;

  const {
    id: VAAId,
    timestamp,
    tokenAmount,
    usdAmount,
    symbol,
    emitterChain,
    emitterAddress,
    emitterNativeAddress,
    standardizedProperties,
    globalTx,
    payload,
  } = txData || {};

  const {
    callerAppId,
    parsedPayload,
    payloadType,
    tokenAddress: payloadTokenAddress,
    tokenChain: payloadTokenChain,
  } = payload || {};

  const { originTx, destinationTx } = globalTx || {};

  const {
    amount,
    appIds,
    fee,
    fromAddress: stdFromAddress,
    fromChain: stdFromChain,
    toAddress: stdToAddress,
    toChain: stdToChain,
    tokenAddress: stdTokenAddress,
    tokenChain: stdTokenChain,
  } = standardizedProperties || {};

  const { from: globalFrom, timestamp: globalFromTimestamp } = originTx || {};

  const {
    chainId: globalToChainId,
    from: globalTo,
    timestamp: globalToTimestamp,
    txHash: globalToRedeemTx,
  } = destinationTx || {};

  const fromChainOrig = emitterChain || stdFromChain;
  const fromAddress = globalFrom || stdFromAddress;
  const toAddress = stdToAddress || globalTo;
  const startDate = timestamp || globalFromTimestamp;
  const endDate = globalToTimestamp;
  const tokenChain = stdTokenChain || payloadTokenChain;
  const tokenAddress = stdTokenAddress || payloadTokenAddress;
  const isUnknownApp = callerAppId === UNKNOWN_APP_ID || appIds?.includes(UNKNOWN_APP_ID);
  const isAttestation = txType[payloadType] === "Attestation";
  const isUnknownPayloadType = !txType[payloadType];

  const parsedEmitterAddress = parseAddress({
    value: emitterNativeAddress ? emitterNativeAddress : emitterAddress,
    chainId: emitterChain as ChainId,
  });
  const isGatewaySource = originTx?.attribute?.type === "wormchain-gateway";

  // Gateway Transfers
  const fromChain = isGatewaySource ? originTx?.attribute?.value?.originChainId : fromChainOrig;
  const toChain = parsedPayload?.["gateway_transfer"]?.chain
    ? parsedPayload?.["gateway_transfer"].chain
    : stdToChain || globalToChainId;

  const parsedOriginAddress = isGatewaySource
    ? originTx?.attribute?.value?.originAddress
    : parseAddress({
        value: fromAddress,
        chainId: fromChainOrig as ChainId,
      });
  const parsedDestinationAddress = parsedPayload?.["gateway_transfer"]?.recipient
    ? parsedPayload?.["gateway_transfer"].recipient
    : parseAddress({
        value: toAddress,
        chainId: toChain as ChainId,
      });
  // --- x ---

  const parsedRedeemTx = parseTx({ value: globalToRedeemTx, chainId: toChain as ChainId });

  const amountSent = formatCurrency(Number(tokenAmount));
  const amountSentUSD = +usdAmount ? formatCurrency(+usdAmount) : "";
  const redeemedAmount = formatCurrency(formatUnits(+amount - +fee));

  const originDateParsed = formatDate(startDate);
  const destinationDateParsed = formatDate(endDate);

  const overviewAndDetailProps = {
    amountSent,
    amountSentUSD,
    currentNetwork,
    destinationDateParsed,
    fee,
    fromChain,
    fromChainOrig,
    guardianSignaturesCount,
    isGatewaySource,
    isUnknownApp,
    parsedDestinationAddress,
    parsedEmitterAddress,
    parsedOriginAddress,
    parsedPayload,
    parsedRedeemTx,
    redeemedAmount,
    symbol,
    toChain,
    tokenAddress,
    tokenAmount,
    tokenChain,
    totalGuardiansNeeded,
    VAAId,
  };

  // --- Automatic Relayer Detection and handling ---
  const [genericRelayerInfo, setGenericRelayerInfo] = useState<DeliveryLifecycleRecord>(null);
  const [loadingRelayers, setLoadingRelayers] = useState(false);
  const getRelayerInfo = useCallback(async () => {
    setLoadingRelayers(true);
    populateDeliveryLifecycleRecordByVaa(environment, vaa)
      .then((result: DeliveryLifecycleRecord) => {
        setLoadingRelayers(false);
        setGenericRelayerInfo(result);
      })
      .catch((e: any) => {
        setLoadingRelayers(false);
        console.error("automatic relayer tx errored:", e);
        setIsGenericRelayerTx(false);
      });
  }, [vaa, environment]);

  const targetContract = environment.chainInfos.find(
    a => a.chainId === fromChain,
  )?.relayerContractAddress;

  const [isGenericRelayerTx, setIsGenericRelayerTx] = useState(
    targetContract?.toUpperCase() === parsedEmitterAddress?.toUpperCase(),
  );

  useEffect(() => {
    const isGeneric = targetContract?.toUpperCase() === parsedEmitterAddress?.toUpperCase();
    setIsGenericRelayerTx(isGeneric);
    if (isGeneric) {
      console.log("isGenericRelayerTx!!!");
      getRelayerInfo();
    }
  }, [targetContract, parsedEmitterAddress, getRelayerInfo]);
  // --- x ---

  const OverviewContent = () => {
    if (isGenericRelayerTx) {
      if (loadingRelayers) return <Loader />;
      return <RelayerOverview VAAData={VAAData} lifecycleRecord={genericRelayerInfo} />;
    }

    if (showOverviewDetail) {
      return (
        <>
          <Details {...overviewAndDetailProps} />
          <AlertsContent />
        </>
      );
    }

    return (
      <>
        <Overview
          {...overviewAndDetailProps}
          globalToRedeemTx={globalToRedeemTx}
          isAttestation={isAttestation}
          originDateParsed={originDateParsed}
        />
        <AlertsContent />
      </>
    );
  };

  const RawDataContent = () => {
    if (isGenericRelayerTx && loadingRelayers) return <Loader />;
    return (
      <RawData
        extraRawInfo={extraRawInfo}
        lifecycleRecord={genericRelayerInfo}
        txData={txData}
        VAAData={VAAData}
      />
    );
  };

  const AlertsContent = () => {
    if (!hasVAA && !isUnknownPayloadType) return null;
    return (
      <div className="tx-information-alerts">
        <div className="tx-information-alerts-unknown-payload-type">
          <Alert type="info">
            {hasVAA
              ? "Data being shown is incomplete because there is no emitted VAA for this transaction yet. Wait 20 minutes and try again."
              : "This VAA comes from another multiverse, we don't have more details about it."}
          </Alert>
        </div>
      </div>
    );
  };

  return (
    <section className="tx-information">
      <Tabs
        isGenericRelayerTx={isGenericRelayerTx}
        setShowOverview={setShowOverview}
        setShowOverviewDetail={setShowOverviewDetail}
        showOverview={showOverview}
        showOverviewDetail={showOverviewDetail}
      />
      <Summary
        appIds={appIds}
        currentNetwork={currentNetwork}
        isUnknownApp={isUnknownApp}
        parsedDestinationAddress={parsedDestinationAddress}
        toChain={toChain}
        vaa={vaa}
      />

      {showOverview ? <OverviewContent /> : <RawDataContent />}
    </section>
  );
};

export { Information };
