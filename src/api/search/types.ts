import { GlobalTxOutput } from "src/api/guardian-network/types";
import { PageRequest } from "src/api/model";
import { Pagination } from "src/api/types";
import { BigNumber } from "ethers";

export interface FindVAAByAddressOutput {
  data: Data;
  pagination: Pagination;
}

export interface Data {
  vaas: VAA[];
}

export interface VAA {
  appId: string;
  emitterAddr: string;
  emitterChain: number;
  guardianSetIndex: number;
  id: string;
  indexedAt: string;
  nativeTxHash: string;
  payload: any;
  timestamp: string;
  txHash: string;
  updatedAt: string;
  vaa: number[];
  version: number;
}

export type GetTokenInput = {
  chainId: number;
  tokenAddress: string;
};

export type GetTokenOutput = {
  symbol: string;
  coingeckoId: string;
  decimals: number;
};

export type GetTokenPriceInput = {
  coingeckoId: string;
  query: {
    date: string;
    localization?: boolean;
  };
};

export type GetTokenPriceOutput = {
  usd: number;
};

export type GetTransactionsInput = (
  | {
      chainId?: number;
      emitter?: string;
      seq?: number;
    }
  | {
      chainId: number;
      emitter: string;
      seq: number;
    }
) & {
  query?: {
    address?: string;
  };
  pagination?: PageRequest;
};

export type CctpRelayOutput = {
  status: string;
  metrics: {
    completedAt: string;
    receivedAt: string;
  };
  fee: {
    amount: number;
    symbol: string;
  };
  from: {
    amountSent: number;
    amountToSwap: number;
    chain: string;
    chainId: number;
    estimatedNativeAssetAmount: number;
    senderAddress: string;
    symbol: string;
    txHash: string;
  };
  to: {
    chain: string;
    chainId: number;
    gasUsed: number;
    recipientAddress: string;
    txHash: string;
  };
  vaa: string;
};

export interface AutomaticRelayOutput {
  completedAt: string;
  failedAt: string;
  id: string;
  receivedAt: string;
  relayer: string;
  status: string;
  data: {
    fromTxHash: string;
    toTxHash: string;
    maxAttempts: number;
    delivery: {
      relayGasUsed: number;
      targetChainDecimals: number;
      budget: string;
      maxRefund: string;
      execution: {
        detail: string;
        gasUsed: string;
        refundStatus: string;
        revertString: string;
        status: string;
        transactionHash: string;
      };
    };
    instructions: {
      encodedExecutionInfo: string;
      refundAddress: string;
      refundChainId: number;
      refundDeliveryProvider: string;
      senderAddress: string;
      sourceDeliveryProvider: string;
      targetAddress: string;
      targetChainId: number;
      vaaKeys: any;
      extraReceiverValue: BigNumber;
      requestedReceiverValue: BigNumber;
    };
  };
}

export type GetTransactionsOutput = {
  id: string;
  timestamp: Date;
  txHash: string;
  emitterChain: number;
  emitterAddress: string;
  emitterNativeAddress: string;
  tokenAmount: string;
  usdAmount: string;
  symbol: string;
  payload: {
    amount?: string;
    callerAppId?: string;
    fee?: string;
    fromAddress?: string;
    parsedPayload?: any;
    payload?: string;
    payloadType?: number;
    toAddress?: string;
    toChain?: number;
    tokenAddress?: string;
    tokenChain?: number;
    decimals?: number;
    name?: string;
    symbol?: string;
  };
  standardizedProperties: {
    amount: string;
    appIds: string[];
    fee: string;
    feeAddress: string;
    feeChain: number;
    fromAddress: string;
    fromChain: number;
    toAddress: string;
    toChain: number;
    tokenAddress: string;
    tokenChain: number;
    wrappedTokenAddress?: string;
    wrappedTokenSymbol?: string;

    overwriteFee?: string;
    overwriteRedeemAmount?: string;
    overwriteSourceSymbol?: string;
    overwriteSourceTokenAddress?: string;
    overwriteSourceTokenChain?: number;
    overwriteTargetSymbol?: string;
    overwriteTargetTokenAddress?: string;
    overwriteTargetTokenChain?: number;
  };
  globalTx: GlobalTxOutput;
};

export type GetBlockData = {
  currentBlock: number;
  lastFinalizedBlock: number;
};
