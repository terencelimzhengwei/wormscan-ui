import { ArrowRightIcon } from "@radix-ui/react-icons";
import { BlockchainIcon } from "src/components/atoms";
import { txType } from "src/consts";
import { formatAppIds, formatUnits } from "src/utils/crypto";
import "./styles.scss";

type Props = {
  originChainId: number;
  destinationChainId?: number;
  transactionTimeInMinutes?: number;
  symbol?: string;
  fee?: string;
  appIds?: string[];
  payloadType: number;
  startDate?: string | Date;
};

const Summary = ({
  transactionTimeInMinutes,
  fee,
  appIds,
  symbol,
  originChainId,
  destinationChainId,
  payloadType,
  startDate,
}: Props) => {
  const isAttestation = txType[payloadType] === "Attestation";
  const parsedStartDate = new Date(startDate).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const formattedStartDate = parsedStartDate.replace(/(.+),\s(.+),\s/g, "$1, $2 at ");

  return (
    <div className="tx-information-summary">
      {transactionTimeInMinutes ? (
        <div>
          <div className="key">Tx Time:</div>
          <div className={"value"}>
            {transactionTimeInMinutes ? `${transactionTimeInMinutes} MIN` : "In progress"}
          </div>
        </div>
      ) : (
        <div>
          <div className="key">Timestamp:</div>
          <div className={"value"}>{formattedStartDate}</div>
        </div>
      )}
      {fee && (
        <div>
          <div className="key">Fee:</div>
          <div className="value">
            {formatUnits(Number(fee))} {symbol || ""}
          </div>
        </div>
      )}
      <div>
        <div className="key">{!isAttestation ? "Chains:" : "Chain:"}</div>
        <div className="chains">
          <div className="chains-container">
            <BlockchainIcon size={20} chainId={originChainId || 0} />
          </div>
          {!isAttestation && (
            <>
              <ArrowRightIcon className="arrow-icon" />
              <div className={`chains-container ${!destinationChainId && "disabled"}`}>
                <BlockchainIcon
                  size={20}
                  chainId={destinationChainId || 0}
                  dark={!destinationChainId}
                />
              </div>
            </>
          )}
        </div>
      </div>
      {appIds?.length > 0 && (
        <div>
          <div className="key">Origin App:</div>
          <div className="value">{formatAppIds(appIds)}</div>
        </div>
      )}
    </div>
  );
};

export default Summary;
