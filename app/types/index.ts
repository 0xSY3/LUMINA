// types/index.ts

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export interface FlowTransactionDetails {
    hash: string;
    network: string;
    status: string;
    timestamp: string;
    from: string;
    to: string;
    value: string;
    gasUsed: string;
    gasPrice: string;
    chainId: number;
    blockNumber: number;
    blockExplorer?: string;
}

export interface FlowTransferDetails {
    type: 'native' | 'token' | 'nft';
    from: string;
    to: string;
    amount?: string;
    tokenAddress?: string;
    tokenId?: string;
    tokenName?: string;
    tokenSymbol?: string;
}

export interface TRANSFERS {
    tokenType: string;
    token: any;
    from: string;
    to: string;
    value?: string;
    tokenId?: string;
    tokenIds?: string[];
    amounts?: string[];
    operator?: string;
}

export interface FlowNetworkInfo {
    chainId: number;
    name: string;
    shortName: string;
    currency: string;
    symbol: string;
    decimals: number;
    rpcUrl: string;
    blockExplorer: string;
    testnet: boolean;
}

export interface FlowBlockInfo {
    number: number;
    hash: string;
    timestamp: string;
    gasUsed: string;
    gasLimit: string;
    transactionCount: number;
    miner: string;
}

export interface FlowTokenInfo {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    totalSupply?: string;
    type: 'ERC20' | 'ERC721' | 'ERC1155';
}

export interface FlowAnalysisResult {
    network: {
        name: string;
        chainId: number;
        currency: string;
        blockNumber: number;
        blockTimestamp: string;
        blockExplorer?: string;
        testnet: boolean;
    };
    transaction: {
        hash: string;
        from: string;
        to: string | null;
        value: string;
        status: string;
        gasUsed: string;
        gasPrice: string;
        totalCost: string;
        nonce: number;
        functionSelector?: string;
    };
    actionTypes: string[];
    transfers: TRANSFERS[];
    actions: any[];
    interactions: string[];
    securityInfo: any[];
    otherEvents: any[];
    summary: {
        totalTransfers: number;
        uniqueTokens: number;
        uniqueContracts: number;
        complexityScore: string;
        riskLevel: string;
        flowSpecific?: {
            network: string;
            evmCompatible: boolean;
        };
    };
}