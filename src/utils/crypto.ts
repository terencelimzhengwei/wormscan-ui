import { ChainId, isEVMChain, tryHexToNativeString } from "@certusone/wormhole-sdk";

export const formatUnits = (value: number, tokenDecimals = 8) => {
  if (!value) return 0;

  return value / 10 ** tokenDecimals;
};

export const shortAddress = (address: string) => {
  if (!address) return "";
  if (address.length <= 12) return address;

  return `${address?.slice(0, 6) || ""}...${address?.slice(-6) || ""}`;
};

export const shortVaaId = (vaaId: string) => {
  if (!vaaId) return "";

  const splitId = vaaId.split("/");
  const seq = splitId[2];

  return `${vaaId?.slice(0, 6) || ""}.../${seq || ""}`;
};

export const parseAddress = ({
  value,
  chainId,
  anyChain,
}: {
  value: string;
  chainId: ChainId;
  anyChain?: boolean;
}) => {
  if (!value) return "";

  let parsedValue = value;
  try {
    if (anyChain ? true : isEVMChain(chainId)) {
      parsedValue = tryHexToNativeString(value, chainId);
    }
  } catch (e: unknown) {
    // console.log(e);
  }

  return parsedValue;
};

export const parseTx = ({ value, chainId }: { value: string; chainId: ChainId }) => {
  if (!value) return "";

  let parsedValue = value;

  try {
    if (isEVMChain(chainId)) {
      if (String(parsedValue).startsWith("0x")) {
        return parsedValue;
      }
      parsedValue = "0x" + parsedValue;
    }
  } catch (e: unknown) {
    // console.log(e);
  }

  return parsedValue;
};

export const formatAppIds = (appIds: string[]) =>
  appIds
    .filter(appId => appId !== "UNKNOWN")
    .map(appId => {
      if (appId === "GENERIC_RELAYER") {
        return "Automatic Relayer";
      }
      if (appId === "WORMCHAIN_GATEWAY_TRANSFER") {
        return "Wormhole Gateway Transfer";
      }
      if (appId === "CCTP_MANUAL") {
        return "CCTP Manual";
      }
      if (appId === "CCTP_WORMHOLE_INTEGRATION") {
        return "CCTP Wormhole Integration";
      }

      return appId
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
    })
    .join(", ");
