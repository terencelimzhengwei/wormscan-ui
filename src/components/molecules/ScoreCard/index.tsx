import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import client from "src/api/Client";
import { Loader } from "src/components/atoms";
import { formatCurrency, formatNumber } from "src/utils/number";
import "./styles.scss";

const ScoreCard = () => {
  const { t } = useTranslation();

  const {
    isLoading,
    error,
    data: scoreData,
  } = useQuery("scoresResponse", () => client.guardianNetwork.getScores());

  const {
    tvl,
    total_volume,
    total_tx_count,
    "24h_volume": volume24h,
    "24h_tx_count": tx_count24h,
    "24h_messages": messages24h,
  } = scoreData || {};

  return (
    <div className="home-statistics-data" data-testid="home-score-card">
      <div className="home-statistics-title">Wormhole stats</div>
      {isLoading ? (
        <div className="home-statistics-loader">
          <Loader />
        </div>
      ) : (
        <div className="home-statistics-data-container">
          <div className="home-statistics-data-container-item">
            <div className="home-statistics-data-container-item-title">
              {t("home.statistics.tvl")}
            </div>
            <div className="home-statistics-data-container-item-value">
              ${tvl ? formatCurrency(tvl, 0) : "-"}
            </div>
          </div>

          <div className="home-statistics-data-container-item">
            <div className="home-statistics-data-container-item-title">
              {t("home.statistics.allVolume")}
            </div>
            <div className="home-statistics-data-container-item-value">
              ${total_volume ? formatCurrency(total_volume, 0) : "-"}
            </div>
          </div>

          <div className="home-statistics-data-container-item">
            <div className="home-statistics-data-container-item-title">
              {t("home.statistics.allTxn")}
            </div>
            <div className="home-statistics-data-container-item-value">
              {total_tx_count ? formatNumber(total_tx_count, 0) : "-"}
            </div>
          </div>

          <hr />

          <div className="home-statistics-data-container-item">
            <div className="home-statistics-data-container-item-title">
              {t("home.statistics.messageVolume")}
            </div>
            <div className="home-statistics-data-container-item-value">
              ${volume24h ? formatCurrency(volume24h, 0) : "-"}
            </div>
          </div>

          <div className="home-statistics-data-container-item">
            <div className="home-statistics-data-container-item-title">
              {t("home.statistics.dayTxn")}
            </div>
            <div className="home-statistics-data-container-item-value">
              {tx_count24h ? formatNumber(tx_count24h, 0) : "-"}
            </div>
          </div>

          <div className="home-statistics-data-container-item">
            <div className="home-statistics-data-container-item-title">
              {t("home.statistics.dayMessage")}
            </div>
            <div className="home-statistics-data-container-item-value">
              {messages24h ? formatNumber(messages24h, 0) : "-"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreCard;
