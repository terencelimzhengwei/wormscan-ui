import { useRef, useState } from "react";
import Draggable from "react-draggable";
import { Network } from "@certusone/wormhole-sdk";
import { BlockchainIcon } from "src/components/atoms";
import { formatCurrency } from "src/utils/number";
import useOutsideClick from "src/utils/hooks/useOutsideClick";
import { ChainId } from "src/api";
import { CrossChainBy } from "src/api/guardian-network/types";
import { Info } from "./Chart";

type Props = {
  chainName: string;
  currentNetwork: Network;
  destinations: any[];
  selectedDestination: "sources" | "destinations";
  selectedInfo: Info;
  selectedType: CrossChainBy;
};

export const StickyInfo = ({
  chainName,
  currentNetwork,
  destinations,
  selectedDestination,
  selectedInfo,
  selectedType,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const stickyRef = useRef<HTMLDivElement>(null);

  const mouseCanceled = useRef(false);

  useOutsideClick(stickyRef, ev => {
    if (isOpen && window.innerHeight < 1180) {
      ev.preventDefault();
      setIsOpen(false);
    }
  });

  return (
    <div className="cross-chain-sticky" ref={stickyRef}>
      <div
        className="cross-chain-sticky-container"
        onClick={() => {
          if (mouseCanceled.current) {
            mouseCanceled.current = false;
          } else {
            setIsOpen(true);
          }
        }}
        style={{
          height: isOpen ? 530 : 100,
          cursor: isOpen ? "default" : "pointer",
        }}
      >
        <Draggable
          axis="none"
          disabled={!isOpen && !mouseCanceled.current}
          position={{ x: 0, y: 2 }}
          onStart={() => {
            mouseCanceled.current = false;
            setIsDragging(true);
          }}
          onStop={() => setIsDragging(false)}
          onDrag={(_ev, data) => {
            if (isDragging) {
              if (data.y > 20) {
                setIsOpen(false);
                setIsDragging(false);
                mouseCanceled.current = true;
              }
              if (data.y < -20) {
                setIsOpen(true);
                setIsDragging(false);
              }
            }
          }}
        >
          <div style={{ cursor: isOpen ? "grab" : "pointer" }}>
            <div className="cross-chain-sticky-line">
              <div className="cross-chain-sticky-line-draw" />
            </div>

            <div className="cross-chain-sticky-subtitle">
              {selectedDestination === "sources" ? "Source" : "Target"}
            </div>
            <div className="cross-chain-sticky-info">
              <span className="cross-chain-sticky-info-source">{chainName}</span>
              <span className="cross-chain-sticky-info-value">
                {selectedInfo?.percentage.toFixed(2)}% |{" "}
                {selectedType === "tx"
                  ? selectedInfo.volume
                  : "$" + formatCurrency(+selectedInfo.volume, 0)}
              </span>
            </div>
          </div>
        </Draggable>

        <div className="cross-chain-sticky-destinations" style={{ opacity: isOpen ? 1 : 0 }}>
          <div className="cross-chain-sticky-separator" />

          <div className="cross-chain-sticky-subtitle">
            {selectedDestination === "sources" ? "Destinations" : "Sources"}
          </div>

          {destinations.map(destination => (
            <div key={destination.chain} className="cross-chain-sticky-info spaced">
              <span>
                <BlockchainIcon
                  chainId={destination.chain}
                  className="chain-icon"
                  dark={true}
                  network={currentNetwork}
                  size={22}
                />
              </span>
              <span className="cross-chain-sticky-info-destination">
                {ChainId[destination.chain] ?? "Unset"}
              </span>
              <span className="cross-chain-sticky-info-value">
                {destination.percentage.toFixed(2)}% |{" "}
                {selectedType === "tx"
                  ? destination.volume
                  : "$" + formatCurrency(+destination.volume, 0)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
