import { ArrowRightIcon } from "@radix-ui/react-icons";
import { BlockchainIcon } from "src/components/atoms";
import { formatNumber } from "src/utils/number";
import "./styles.scss";

type Props = {
  from_chain: {
    id: number;
    name: string;
  };
  to_chain: {
    id: number;
    name: string;
  };
  transactions: number;
};

const TopChainListItem = ({ from_chain, to_chain, transactions }: Props) => {
  const { id: fromId, name: fromName } = from_chain;
  const { id: toId, name: toName } = to_chain;

  return (
    <div className="top-chain-list-item">
      <div className="top-chain-list-item-from">
        <BlockchainIcon size={25} chainId={fromId} />
        <div className="top-chain-list-item-from-chain">{fromName}</div>
      </div>
      <ArrowRightIcon className="arrow-icon" />
      <div className="top-chain-list-item-to">
        <BlockchainIcon size={25} chainId={toId} />
        <div className="top-chain-list-item-to-chain">{toName}</div>
      </div>
      <div className="top-chain-list-item-transactions">{formatNumber(transactions)}</div>
    </div>
  );
};

export default TopChainListItem;
