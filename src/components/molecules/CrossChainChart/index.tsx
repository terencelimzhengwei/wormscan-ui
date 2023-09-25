import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { useEnvironment } from "src/context/EnvironmentContext";
import i18n from "src/i18n";
import { Loader, Select, ToggleGroup } from "src/components/atoms";
import { ErrorPlaceholder } from "src/components/molecules";
import { getClient } from "src/api/Client";
import { CrossChainBy } from "src/api/guardian-network/types";
import { Chart } from "./Chart";
import "./styles.scss";

const MAINNET_TYPE_LIST = [
  { label: i18n.t("home.crossChain.volume"), value: "notional", ariaLabel: "Volume" },
  { label: i18n.t("home.crossChain.count"), value: "tx", ariaLabel: "Transactions" },
];

const TESTNET_TYPE_LIST = [
  { label: i18n.t("home.crossChain.count"), value: "tx", ariaLabel: "Transactions" },
];

const RANGE_LIST = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "Last 365 days", value: "1y" },
  { label: "All Time", value: "all-time" },
];

const CrossChainChart = () => {
  const { environment } = useEnvironment();
  const currentNetwork = environment.network;
  const { t } = useTranslation();

  const [TYPE_LIST, setTypeList] = useState(MAINNET_TYPE_LIST);
  const [selectedType, setSelectedType] = useState<CrossChainBy>("notional");
  const [selectedTimeRange, setSelectedTimeRange] = useState(RANGE_LIST[0]);
  const [selectedDestination, setSelectedDestination] = useState<"sources" | "destinations">(
    "sources",
  );
  const isSources = selectedDestination === "sources";

  useEffect(() => {
    if (currentNetwork === "MAINNET") {
      setTypeList(MAINNET_TYPE_LIST);
    } else {
      setSelectedType("tx");
      setTypeList(TESTNET_TYPE_LIST);
    }
  }, [currentNetwork]);

  const { data, isError, isLoading, isFetching } = useQuery(
    ["getLastTxs", selectedType, selectedTimeRange.value],
    () =>
      getClient().guardianNetwork.getCrossChainActivity({
        by: selectedType,
        timeSpan: selectedTimeRange.value,
      }),
    { cacheTime: 0 },
  );

  return (
    <div className="cross-chain" data-testid="cross-chain-card">
      <div className="cross-chain-title">{t("home.crossChain.title")}</div>

      <div className="cross-chain-options">
        {currentNetwork === "MAINNET" ? (
          <ToggleGroup
            value={selectedType}
            onValueChange={value => setSelectedType(value)}
            items={TYPE_LIST}
            ariaLabel="Select type"
            className="cross-chain-options-items"
          />
        ) : (
          <div className="cross-chain-options-txsText">Transactions</div>
        )}

        <div className="cross-chain-destination" aria-label="Select graphic type">
          <div
            onClick={() => setSelectedDestination("sources")}
            className={isSources ? "cross-chain-destination-selected" : ""}
          >
            SOURCE
          </div>
          <div
            onClick={() => setSelectedDestination("destinations")}
            className={isSources ? "" : "cross-chain-destination-selected"}
          >
            TARGET
          </div>
        </div>

        <div className="cross-chain-filters">
          <div className="cross-chain-filters-group">
            <span className="cross-chain-filters-text">{t("home.crossChain.timeRange")}</span>
            <Select
              name="timeRange"
              value={selectedTimeRange}
              onValueChange={(value: any) => setSelectedTimeRange(value)}
              items={RANGE_LIST}
              ariaLabel="Select Time Range"
              className="cross-chain-filters-select"
            />
          </div>
        </div>
      </div>

      {isLoading || isFetching ? (
        <Loader />
      ) : (
        <>
          {isError ? (
            <ErrorPlaceholder errorType="sankey" />
          ) : (
            <Chart
              data={data}
              selectedType={selectedType}
              selectedDestination={selectedDestination}
            />
          )}
        </>
      )}

      <div className="cross-chain-message">
        {selectedDestination === "destinations" && (
          <div>{t("home.crossChain.bottomMessageDestinations")}</div>
        )}
        <div>Wormhole Activity</div>
        {selectedDestination === "sources" && (
          <div>{t("home.crossChain.bottomMessageSources")}</div>
        )}
      </div>
    </div>
  );
};

export default CrossChainChart;
