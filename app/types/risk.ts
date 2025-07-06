export interface RiskScore {
  overall: number; // 0-100 (0 = safest, 100 = highest risk)
  confidence: number; // 0-100 confidence in the assessment
  category: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: RiskFactor[];
}

export interface RiskFactor {
  type: 'CONTRACT_VERIFICATION' | 'TRANSACTION_PATTERN' | 'ADDRESS_AGE' | 'BALANCE_ANALYSIS' | 'INTERACTION_HISTORY' | 'SCAM_DATABASE' | 'GAS_ANALYSIS';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score: number; // Individual factor score 0-100
  description: string;
  evidence?: string;
}

export interface AddressAnalysis {
  address: string;
  isContract: boolean;
  isVerified?: boolean;
  contractName?: string;
  firstSeen?: Date;
  lastActivity?: Date;
  transactionCount: number;
  balance: string;
  riskScore: RiskScore;
  flags: SecurityFlag[];
}

export interface SecurityFlag {
  type: 'SCAM' | 'PHISHING' | 'RUG_PULL' | 'HONEYPOT' | 'SUSPICIOUS_PATTERN' | 'UNVERIFIED_CONTRACT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  source: string;
  confidence: number;
}

export interface TransactionRiskAnalysis {
  fromAddress: AddressAnalysis;
  toAddress: AddressAnalysis;
  amount: string;
  estimatedGas: string;
  gasOptimization?: GasOptimization;
  overallRisk: RiskScore;
  recommendations: string[];
  warnings: string[];
}

export interface GasOptimization {
  currentGasPrice: string;
  recommendedGasPrice: string;
  potentialSavings: string;
  optimalTimeToSend?: string;
  networkCongestion: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface TimelineEvent {
  txHash: string;
  timestamp: Date;
  type: 'SEND' | 'RECEIVE' | 'CONTRACT_INTERACTION' | 'TOKEN_TRANSFER' | 'NFT_TRANSFER';
  amount?: string;
  token?: string;
  counterparty: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  gasUsed: string;
  gasPrice: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  description: string;
}

export interface AddressTimeline {
  address: string;
  events: TimelineEvent[];
  summary: {
    totalTransactions: number;
    totalVolume: string;
    riskEvents: number;
    averageGasPrice: string;
    mostActiveDay: string;
  };
  patterns: PatternAnalysis;
}

export interface PatternAnalysis {
  isBot: boolean;
  regularityScore: number; // 0-100 (100 = very regular pattern)
  suspiciousPatterns: string[];
  tradingBehavior: 'NORMAL' | 'HIGH_FREQUENCY' | 'SUSPICIOUS' | 'AUTOMATED';
  riskFactors: string[];
}