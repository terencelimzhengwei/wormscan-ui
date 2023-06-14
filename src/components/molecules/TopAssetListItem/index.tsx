import { ArrowRightIcon } from "@radix-ui/react-icons";
import { BlockchainIcon } from "src/components/atoms";
import { formatCurrency } from "src/utils/number";
import { getChainName } from "src/utils/wormhole";
import noIconToken from "src/icons/tokens/noIcon.svg";
import "./styles.scss";

type Props = {
  from_chain: number;
  token_logo: string;
  symbol: string;
  volume: string;
};

const TopAssetListItem = ({ from_chain, token_logo, symbol, volume }: Props) => {
  return (
    <div className="top-asset-list-item">
      <div className="top-asset-list-item-from">
        <div className="top-asset-list-item-from-icon-container">
          <BlockchainIcon
            size={25}
            chainId={from_chain}
            className="top-asset-list-item-from-icon"
          />
        </div>

        <div className="top-asset-list-item-from-chain">
          {getChainName({ chainId: from_chain, acronym: true })}
        </div>
      </div>
      <div>
        <ArrowRightIcon className="arrow-icon" />
      </div>
      <div className="top-asset-list-item-to">
        <div className="top-asset-list-item-to-icon-container">
          <img
            src={token_logo || noIconToken}
            alt={`${symbol} icon`}
            width="25"
            className="top-asset-list-item-to-icon"
          />
        </div>

        <div className="top-asset-list-item-to-asset">{symbol}</div>
      </div>
      <div className="top-asset-list-item-transactions">${formatCurrency(Number(volume), 0)}</div>
    </div>
  );
};

export default TopAssetListItem;
