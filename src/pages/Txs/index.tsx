import { CopyIcon } from "@radix-ui/react-icons";
import { ChainId, Order, GetTransactionsOutput } from "@xlabs-libs/wormscan-sdk";
import { useCallback, useEffect, useState, useRef } from "react";
import { useQuery } from "react-query";
import { useSearchParams } from "react-router-dom";
import { getClient, getCurrentNetwork } from "src/api/Client";
import { BlockchainIcon, Loader, Link } from "src/components/atoms";
import { CopyToClipboard, StatusBadge } from "src/components/molecules";
import { BaseLayout } from "src/layouts/BaseLayout";
import { parseAddress, parseTx, shortAddress } from "src/utils/crypto";
import { timeAgo } from "src/utils/date";
import { formatCurrency } from "src/utils/number";
import { getChainName, getExplorerLink } from "src/utils/wormhole";
import { Information } from "./Information";
import { Top } from "./Top";
import { NETWORK, TxStatus } from "../../types";
import { useNavigateCustom } from "src/utils/hooks/useNavigateCustom";
import "./styles.scss";

export interface TransactionOutput {
  id: string;
  txHash: React.ReactNode;
  from: React.ReactNode;
  to: React.ReactNode;
  status: React.ReactNode;
  amount: number | string;
  time: Date | string;
}

export const PAGE_SIZE = 50;
const REFETCH_TIME = 1000 * 10;

const Txs = () => {
  const navigate = useNavigateCustom();
  const [searchParams, setSearchParams] = useSearchParams();
  const address = searchParams.get("address");
  const network = (searchParams.get("network") as NETWORK) || "mainnet";
  const page = Number(searchParams.get("page"));
  const currentPage = page >= 1 ? page : 1;
  const currentNetwork = useRef(network);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPaginationLoading, setIsPaginationLoading] = useState<boolean>(false);
  const [addressChainId, setAddressChainId] = useState<ChainId | undefined>(undefined);
  const [parsedTxsData, setParsedTxsData] = useState<TransactionOutput[] | undefined>(undefined);

  const setCurrentPage = useCallback(
    (pageNumber: number) => {
      setSearchParams(prev => {
        prev.set("page", String(pageNumber));
        return prev;
      });
    },
    [setSearchParams],
  );

  useEffect(() => {
    setIsLoading(true);
  }, [address]);

  useEffect(() => {
    if (currentNetwork.current === getCurrentNetwork()) return;

    currentNetwork.current = network;
    setIsLoading(true);
    setCurrentPage(1);
  }, [network, setCurrentPage]);

  const getTransactionInput = {
    query: {
      ...(address && { address }),
    },
    pagination: {
      page: currentPage - 1,
      pageSize: PAGE_SIZE,
      sortOrder: Order.DESC,
    },
  };

  useQuery(
    ["getTxs", getTransactionInput],
    () => getClient().search.getTransactions(getTransactionInput),
    {
      refetchInterval: () => (currentPage === 1 ? REFETCH_TIME : false),
      onError: () => {
        navigate(`/search-not-found?q=${address || "Txs"}`);
      },
      onSuccess: txs => {
        const tempRows: TransactionOutput[] = [];
        const { standardizedProperties: firstStandardizedProperties, globalTx: firstGlobalTx } =
          txs?.[0] || {};
        const { originTx: firstOriginTx } = firstGlobalTx || {};

        const originChainId = firstStandardizedProperties?.fromChain || firstOriginTx?.chainId;
        const originAddress = firstStandardizedProperties?.fromAddress || firstOriginTx?.from;
        const destinationChainId = firstStandardizedProperties?.toChain;

        const addressChainId =
          String(address).toLowerCase() === String(originAddress).toLowerCase()
            ? originChainId
            : destinationChainId;

        txs?.length > 0
          ? txs?.forEach(tx => {
              const {
                txHash,
                timestamp,
                tokenAmount,
                symbol,
                emitterChain,
                standardizedProperties,
                globalTx,
              } = tx || {};
              const {
                fromChain: stdFromChain,
                fromAddress: stdFromAddress,
                toChain: stdToChain,
                toAddress: stdToAddress,
              } = standardizedProperties || {};
              const { originTx } = globalTx || {};
              const { chainId: globalChainId, from: globalFrom } = originTx || {};

              const fromChain = stdFromChain || globalChainId || emitterChain;
              const fromAddress = stdFromAddress || globalFrom;
              const toChain = stdToChain;
              const toAddress = stdToAddress;

              const parseTxHash = parseTx({
                value: txHash,
                chainId: fromChain as ChainId,
              });
              const parsedOriginAddress = parseAddress({
                value: fromAddress,
                chainId: fromChain as ChainId,
              });
              const parsedDestinationAddress = parseAddress({
                value: toAddress,
                chainId: toChain as ChainId,
              });
              const timestampDate = new Date(timestamp);
              const row = {
                id: txHash,
                txHash: (
                  <div className="tx-hash">
                    {parseTxHash ? (
                      <>
                        <Link to={`/tx/${txHash}`} asNavLink={false} target="_blank">
                          {shortAddress(parseTxHash).toUpperCase()}
                        </Link>
                        <CopyToClipboard toCopy={parseTxHash}>
                          <CopyIcon />
                        </CopyToClipboard>
                      </>
                    ) : (
                      "-"
                    )}
                  </div>
                ),
                from: (
                  <div className="tx-from">
                    <BlockchainIcon chainId={fromChain} size={24} />
                    <div>
                      {getChainName({ chainId: fromChain })}
                      {parsedOriginAddress && (
                        <div className="tx-from-address">
                          <a
                            href={getExplorerLink({
                              chainId: fromChain,
                              value: parsedOriginAddress,
                              base: "address",
                              isNativeAddress: true,
                            })}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {shortAddress(parsedOriginAddress).toUpperCase()}
                          </a>

                          <CopyToClipboard toCopy={parsedOriginAddress}>
                            <CopyIcon />
                          </CopyToClipboard>
                        </div>
                      )}
                    </div>
                  </div>
                ),
                to: (
                  <div className="tx-to">
                    {toChain ? (
                      <>
                        <BlockchainIcon chainId={toChain} size={24} />
                        <div>
                          {getChainName({ chainId: toChain })}
                          <div className="tx-from-address">
                            <a
                              href={getExplorerLink({
                                chainId: toChain,
                                value: parsedDestinationAddress,
                                base: "address",
                                isNativeAddress: true,
                              })}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {shortAddress(parsedDestinationAddress).toUpperCase()}
                            </a>

                            <CopyToClipboard toCopy={parsedDestinationAddress}>
                              <CopyIcon />
                            </CopyToClipboard>
                          </div>
                        </div>
                      </>
                    ) : (
                      "-"
                    )}
                  </div>
                ),
                status: (
                  <div className="tx-status">
                    <StatusBadge status={status as TxStatus} />
                  </div>
                ),
                amount: tokenAmount ? formatCurrency(Number(tokenAmount)) + " " + symbol : "-",
                time: (timestampDate && timeAgo(timestampDate)) || "-",
              };

              tempRows.push(row);
            })
          : [];

        setParsedTxsData(tempRows);
        setAddressChainId(addressChainId as ChainId);
        setIsLoading(false);
        setIsPaginationLoading(false);
      },
    },
  );

  const onChangePagination = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <BaseLayout>
      <div className="txs-page">
        {isLoading ? (
          <Loader />
        ) : (
          <>
            <Top address={address} addressChainId={addressChainId} />
            <Information
              parsedTxsData={parsedTxsData}
              currentPage={currentPage}
              onChangePagination={onChangePagination}
              isPaginationLoading={isPaginationLoading}
              setIsPaginationLoading={setIsPaginationLoading}
            />
          </>
        )}
      </div>
    </BaseLayout>
  );
};

export default Txs;
