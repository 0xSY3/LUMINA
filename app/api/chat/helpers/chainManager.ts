import { createPublicClient, http, PublicClient } from 'viem';
import { defineChain } from 'viem';

export interface Chain {
    name: string;
    chainId: number;
    shortName?: string;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    rpc: string[];
    blockExplorer?: string;
    testnet?: boolean;
}
  
// Chain data management for Flow Networks
export class ChainManager {
    private static instance: ChainManager;
    private chains: Chain[] = [];
    
    // Flow EVM networks configuration with working RPC endpoints
    private readonly FLOW_CHAINS: Chain[] = [
      {
        name: 'Flow EVM Mainnet',
        chainId: 747,
        shortName: 'flow-mainnet',
        nativeCurrency: {
          name: 'Flow',
          symbol: 'FLOW',
          decimals: 18,
        },
        rpc: [
          'https://mainnet.evm.nodes.onflow.org',
          'https://access.mainnet.nodes.onflow.org',
          'https://rest-mainnet.onflow.org'
        ],
        blockExplorer: 'https://evm.flowscan.io',
        testnet: false
      },
      {
        name: 'Flow EVM Testnet',
        chainId: 545,
        shortName: 'flow-testnet',
        nativeCurrency: {
          name: 'Flow',
          symbol: 'FLOW',
          decimals: 18,
        },
        rpc: [
          'https://testnet.evm.nodes.onflow.org',
          'https://access.devnet.nodes.onflow.org',
          'https://rest-testnet.onflow.org'
        ],
        blockExplorer: 'https://evm-testnet.flowscan.io',
        testnet: true
      }
    ];
  
    private constructor() {
      this.chains = [...this.FLOW_CHAINS];
    }
  
    static getInstance(): ChainManager {
      if (!ChainManager.instance) {
        ChainManager.instance = new ChainManager();
      }
      return ChainManager.instance;
    }
  
    async getChain(chainId: number): Promise<Chain | undefined> {
      return this.chains.find(chain => chain.chainId === chainId);
    }
  
    async getProvider(chainId: number): Promise<PublicClient> {
      const chain = await this.getChain(chainId);
      if (!chain) {
        throw new Error(`Unsupported Flow chain ${chainId}. Supported chains: 747 (mainnet), 545 (testnet)`);
      }
      
      if (!chain.rpc || chain.rpc.length === 0) {
        throw new Error(`No RPC endpoints found for Flow chain ${chainId}`);
      }
  
      const errors: Error[] = [];
      
      // Define the Flow chain for viem
      const flowChain = defineChain({
        id: chainId,
        name: chain.name,
        network: chain.shortName || 'flow',
        nativeCurrency: chain.nativeCurrency,
        rpcUrls: {
          default: { http: [chain.rpc[0]] },
          public: { http: chain.rpc }
        },
        blockExplorers: {
          default: { 
            name: 'FlowScan',
            url: chain.blockExplorer || 'https://evm.flowscan.io'
          }
        },
        testnet: chain.testnet
      });
      
      // Try each RPC endpoint with proper error handling and timeouts
      for (const rpc of chain.rpc) {
        try {
          console.log(`Testing Flow RPC: ${rpc}`);
          
          // Create public client with viem
          const client = createPublicClient({
            chain: flowChain,
            transport: http(rpc, {
              timeout: 10000,
            })
          });
          
          // Test the connection
          const blockNumber = await client.getBlockNumber();
          
          if (blockNumber && blockNumber > 0) {
            console.log(`✅ Successfully connected to Flow RPC: ${rpc}, latest block: ${blockNumber}`);
            return client;
          }
          
        } catch (error) {
          console.warn(`❌ Flow RPC ${rpc} failed:`, error?.message || error);
          errors.push(error as Error);
          continue;
        }
      }
      
      throw new Error(`All Flow RPCs failed for chain ${chainId}. Errors: ${errors.map(e => e.message).join(', ')}`);
    }
    
    getAllChains(): Chain[] {
      return [...this.chains];
    }
    
    getMainnetChain(): Chain {
      return this.FLOW_CHAINS[0]; // Flow Mainnet
    }
    
    getTestnetChain(): Chain {
      return this.FLOW_CHAINS[1]; // Flow Testnet
    }
    
    isTestnet(chainId: number): boolean {
      const chain = this.chains.find(c => c.chainId === chainId);
      return chain?.testnet || false;
    }
    
    // Additional utility methods for Flow
    getExplorerUrl(chainId: number, type: 'tx' | 'address' | 'block', value: string): string {
      const chain = this.chains.find(c => c.chainId === chainId);
      const baseUrl = chain?.blockExplorer || (chainId === 747 
        ? 'https://evm.flowscan.io' 
        : 'https://evm-testnet.flowscan.io');
      
      switch (type) {
        case 'tx':
          return `${baseUrl}/tx/${value}`;
        case 'address':
          return `${baseUrl}/address/${value}`;
        case 'block':
          return `${baseUrl}/block/${value}`;
        default:
          return baseUrl;
      }
    }
    
    formatFlowAddress(address: string): string {
      if (!address) return '';
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
}