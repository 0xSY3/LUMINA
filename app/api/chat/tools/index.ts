import { z } from 'zod';
import { Chain } from "@covalenthq/client-sdk";
import CovalentHelper from '../covalentGoldRush';
import { tool } from 'ai';

function serializeBigInts(obj: any): any {
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  if (Array.isArray(obj)) {
    return obj.map(serializeBigInts);
  }
  if (obj && typeof obj === 'object') {
    const newObj: any = {};
    for (const [key, value] of Object.entries(obj)) {
      newObj[key] = serializeBigInts(value);
    }
    return newObj;
  }
  return obj;
}

export const getTransactionTool = tool({
  description: 'Get detailed information about a specific blockchain transaction',
  parameters: z.object({
    txHash: z.string().describe('The transaction hash to analyze'),
    chainId: z.number().describe('The chain ID where the transaction occurred'),
  }),
  execute: async ({ txHash, chainId }) => {
    try {
      const txDetails = await CovalentHelper.getTransactionDetails(chainId as Chain, txHash);
      const serializedTx = serializeBigInts(txDetails);
      return {
        success: true,
        data: JSON.stringify(serializedTx),
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message + "Try getting transaction details form secondaryFallbackAnalyzeTx tool",
      };
    }
  },
});

export const getTokenBalancesTool = tool({
  description: 'Get token balances for a specific wallet address',
  parameters: z.object({
    walletAddress: z.string().describe('The wallet address to check'),
    chainId: z.number().describe('The chain ID to query'),
  }),
  execute: async ({ walletAddress, chainId }) => {
    try {
      const balances = await CovalentHelper.getUserBalance(chainId as Chain, walletAddress);
      const serializedBalances = serializeBigInts(balances);
      return {
        success: true,
        data: JSON.stringify(serializedBalances),
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  },
});

export const getNFTBalancesTool = tool({
  description: 'Get NFT holdings for a specific wallet address, I.e ERC721, ERC1155',
  parameters: z.object({
    walletAddress: z.string().describe('The wallet address to check'),
    chainId: z.number().describe('The chain ID to query'),
  }),
  execute: async ({ walletAddress, chainId }) => {
    try {
      const nfts = await CovalentHelper.getNftDetails(chainId as Chain, walletAddress);
      const serializedNfts = serializeBigInts(nfts);
      return {
        success: true,
        data: JSON.stringify(serializedNfts),
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  },
});

export const getTokenDetailsTool = tool({
  description: 'Get detailed information about a specific token/ ERC20 ',
  parameters: z.object({
    tokenAddress: z.string().describe('The token ERC20 contract address'),
    chainId: z.number().describe('The chain ID where the token exists'),
  }),
  execute: async ({ tokenAddress, chainId }) => {
    try {
      const tokenInfo = await CovalentHelper.getTokenDetails(chainId as Chain, tokenAddress);
      const serializedToken = serializeBigInts(tokenInfo);
      return {
        success: true,
        data: JSON.stringify(serializedToken),
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  },
});