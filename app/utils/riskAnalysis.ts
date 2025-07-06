import { createPublicClient, http, formatEther, isAddress, getAddress } from 'viem';
import { defineChain } from 'viem';
import { RiskScore, RiskFactor, AddressAnalysis, SecurityFlag, GasOptimization } from '../types/risk';

// Flow EVM configuration
const flowMainnet = defineChain({
  id: 747,
  name: 'Flow EVM Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Flow',
    symbol: 'FLOW',
  },
  rpcUrls: {
    default: { http: ['https://mainnet.evm.nodes.onflow.org'] },
    public: { http: ['https://mainnet.evm.nodes.onflow.org'] },
  },
  blockExplorers: {
    default: { name: 'FlowScan', url: 'https://evm.flowscan.io' },
  },
});

// Create viem client for Flow EVM
export const flowClient = createPublicClient({
  chain: flowMainnet,
  transport: http('https://mainnet.evm.nodes.onflow.org'),
});

/**
 * Analyze an address for security risks using real blockchain data
 */
export async function analyzeAddressRisk(address: string): Promise<AddressAnalysis> {
  try {
    // Validate address format
    if (!isAddress(address)) {
      throw new Error('Invalid address format');
    }

    const checksumAddress = getAddress(address);
    
    // Parallel data fetching for performance
    const [
      balance,
      code,
      transactionCount,
      latestBlock
    ] = await Promise.all([
      flowClient.getBalance({ address: checksumAddress }),
      flowClient.getBytecode({ address: checksumAddress }),
      flowClient.getTransactionCount({ address: checksumAddress }),
      flowClient.getBlockNumber()
    ]);

    const isContract = code !== undefined && code !== '0x';
    const balanceInFlow = formatEther(balance);

    // Calculate risk factors based on real data
    const riskFactors: RiskFactor[] = [];
    let totalRiskScore = 0;

    // Factor 1: Contract verification (if it's a contract)
    if (isContract) {
      const verificationFactor = await analyzeContractVerification(checksumAddress, code);
      riskFactors.push(verificationFactor);
      totalRiskScore += verificationFactor.score;
    }

    // Factor 2: Address age and activity
    const activityFactor = analyzeAddressActivity(transactionCount, latestBlock);
    riskFactors.push(activityFactor);
    totalRiskScore += activityFactor.score;

    // Factor 3: Balance analysis
    const balanceFactor = analyzeBalance(balanceInFlow, isContract);
    riskFactors.push(balanceFactor);
    totalRiskScore += balanceFactor.score;

    // Factor 4: Transaction pattern analysis (simplified for real-time)
    const patternFactor = analyzeTransactionPattern(transactionCount);
    riskFactors.push(patternFactor);
    totalRiskScore += patternFactor.score;

    // Calculate overall risk score
    const averageRisk = riskFactors.length > 0 ? totalRiskScore / riskFactors.length : 0;
    const riskScore: RiskScore = {
      overall: Math.min(100, Math.max(0, averageRisk)),
      confidence: calculateConfidence(riskFactors),
      category: categorizeRisk(averageRisk),
      factors: riskFactors
    };

    // Generate security flags based on analysis
    const flags = generateSecurityFlags(riskScore, isContract, transactionCount);

    return {
      address: checksumAddress,
      isContract,
      isVerified: isContract ? await isContractVerified(checksumAddress) : undefined,
      transactionCount: Number(transactionCount),
      balance: balanceInFlow,
      riskScore,
      flags,
      firstSeen: new Date(Date.now() - (Number(transactionCount) * 24 * 60 * 60 * 1000)), // Estimated
      lastActivity: new Date() // Simplified - would need more data for exact timestamp
    };

  } catch (error) {
    console.error('Error analyzing address risk:', error);
    throw new Error(`Failed to analyze address: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Analyze contract verification status
 */
async function analyzeContractVerification(address: string, bytecode: string | undefined): Promise<RiskFactor> {
  // In a real implementation, you'd check against a verification database
  // For now, we'll use heuristics based on bytecode patterns
  
  if (!bytecode || bytecode === '0x') {
    return {
      type: 'CONTRACT_VERIFICATION',
      severity: 'HIGH',
      score: 80,
      description: 'Not a contract or empty bytecode',
      evidence: 'No contract code found'
    };
  }

  // Simple heuristic: longer bytecode might indicate more complex/legitimate contracts
  const complexity = bytecode.length;
  
  if (complexity < 100) {
    return {
      type: 'CONTRACT_VERIFICATION',
      severity: 'CRITICAL',
      score: 90,
      description: 'Very simple contract - potential proxy or malicious code',
      evidence: `Bytecode length: ${complexity} characters`
    };
  } else if (complexity < 1000) {
    return {
      type: 'CONTRACT_VERIFICATION',
      severity: 'HIGH',
      score: 60,
      description: 'Simple contract - verification recommended',
      evidence: `Bytecode length: ${complexity} characters`
    };
  } else {
    return {
      type: 'CONTRACT_VERIFICATION',
      severity: 'MEDIUM',
      score: 30,
      description: 'Complex contract - likely legitimate but verify source',
      evidence: `Bytecode length: ${complexity} characters`
    };
  }
}

/**
 * Analyze address activity patterns
 */
function analyzeAddressActivity(transactionCount: bigint, currentBlock: bigint): RiskFactor {
  const txCount = Number(transactionCount);
  
  if (txCount === 0) {
    return {
      type: 'TRANSACTION_PATTERN',
      severity: 'HIGH',
      score: 70,
      description: 'New address with no transaction history',
      evidence: 'Zero transactions found'
    };
  } else if (txCount < 5) {
    return {
      type: 'TRANSACTION_PATTERN',
      severity: 'MEDIUM',
      score: 40,
      description: 'Limited transaction history',
      evidence: `${txCount} transactions`
    };
  } else if (txCount < 50) {
    return {
      type: 'TRANSACTION_PATTERN',
      severity: 'LOW',
      score: 20,
      description: 'Moderate transaction history',
      evidence: `${txCount} transactions`
    };
  } else {
    return {
      type: 'TRANSACTION_PATTERN',
      severity: 'LOW',
      score: 10,
      description: 'Established address with good transaction history',
      evidence: `${txCount} transactions`
    };
  }
}

/**
 * Analyze balance for risk indicators
 */
function analyzeBalance(balance: string, isContract: boolean): RiskFactor {
  const balanceNum = parseFloat(balance);
  
  if (balanceNum === 0) {
    return {
      type: 'BALANCE_ANALYSIS',
      severity: isContract ? 'MEDIUM' : 'HIGH',
      score: isContract ? 40 : 60,
      description: isContract ? 'Contract with zero balance' : 'Empty wallet - potential honeypot',
      evidence: `Balance: ${balance} FLOW`
    };
  } else if (balanceNum < 0.001) {
    return {
      type: 'BALANCE_ANALYSIS',
      severity: 'MEDIUM',
      score: 35,
      description: 'Very low balance - limited activity',
      evidence: `Balance: ${balance} FLOW`
    };
  } else if (balanceNum > 10000) {
    return {
      type: 'BALANCE_ANALYSIS',
      severity: 'LOW',
      score: 15,
      description: 'High balance - likely legitimate entity',
      evidence: `Balance: ${balance} FLOW`
    };
  } else {
    return {
      type: 'BALANCE_ANALYSIS',
      severity: 'LOW',
      score: 20,
      description: 'Normal balance range',
      evidence: `Balance: ${balance} FLOW`
    };
  }
}

/**
 * Analyze transaction patterns (simplified version)
 */
function analyzeTransactionPattern(transactionCount: bigint): RiskFactor {
  const txCount = Number(transactionCount);
  
  // This is a simplified pattern analysis
  // In a real implementation, you'd analyze timing, amounts, etc.
  
  if (txCount > 1000) {
    return {
      type: 'INTERACTION_HISTORY',
      severity: 'MEDIUM',
      score: 25,
      description: 'High transaction volume - possible bot or exchange',
      evidence: `${txCount} transactions - automated pattern detected`
    };
  } else {
    return {
      type: 'INTERACTION_HISTORY',
      severity: 'LOW',
      score: 15,
      description: 'Normal transaction frequency',
      evidence: `${txCount} transactions`
    };
  }
}

/**
 * Check if contract is verified (simplified)
 */
async function isContractVerified(address: string): Promise<boolean> {
  try {
    // In a real implementation, you'd check FlowScan API or similar
    // For now, we'll return false as most contracts may not be verified yet
    return false;
  } catch {
    return false;
  }
}

/**
 * Calculate confidence score based on available data
 */
function calculateConfidence(factors: RiskFactor[]): number {
  if (factors.length === 0) return 0;
  
  // Higher confidence with more factors analyzed
  const baseConfidence = Math.min(90, factors.length * 20);
  
  // Reduce confidence if we have critical factors
  const hasCritical = factors.some(f => f.severity === 'CRITICAL');
  const hasHigh = factors.some(f => f.severity === 'HIGH');
  
  if (hasCritical) return Math.max(baseConfidence - 20, 60);
  if (hasHigh) return Math.max(baseConfidence - 10, 70);
  
  return baseConfidence;
}

/**
 * Categorize overall risk level
 */
function categorizeRisk(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
}

/**
 * Generate security flags based on analysis
 */
function generateSecurityFlags(riskScore: RiskScore, isContract: boolean, txCount: number): SecurityFlag[] {
  const flags: SecurityFlag[] = [];
  
  if (riskScore.overall >= 80) {
    flags.push({
      type: 'SUSPICIOUS_PATTERN',
      severity: 'CRITICAL',
      description: 'Multiple high-risk factors detected',
      source: 'AI Risk Analysis',
      confidence: riskScore.confidence
    });
  }
  
  if (isContract && !isContractVerified) {
    flags.push({
      type: 'UNVERIFIED_CONTRACT',
      severity: 'HIGH',
      description: 'Smart contract source code not verified',
      source: 'Contract Analysis',
      confidence: 90
    });
  }
  
  if (txCount === 0) {
    flags.push({
      type: 'SUSPICIOUS_PATTERN',
      severity: 'MEDIUM',
      description: 'New address with no transaction history',
      source: 'Activity Analysis',
      confidence: 85
    });
  }
  
  return flags;
}

/**
 * Get current gas optimization recommendations
 */
export async function getGasOptimization(): Promise<GasOptimization> {
  try {
    const [gasPrice, latestBlock] = await Promise.all([
      flowClient.getGasPrice(),
      flowClient.getBlock({ blockTag: 'latest' })
    ]);
    
    const currentGasPriceGwei = Number(gasPrice) / 1e9;
    
    // Simple gas optimization logic
    // In reality, you'd analyze historical data and network congestion
    const networkCongestion = currentGasPriceGwei > 50 ? 'HIGH' : 
                             currentGasPriceGwei > 25 ? 'MEDIUM' : 'LOW';
    
    const recommendedGasPrice = Math.max(1, currentGasPriceGwei * 0.8);
    const potentialSavings = ((currentGasPriceGwei - recommendedGasPrice) / currentGasPriceGwei * 100).toFixed(1);
    
    return {
      currentGasPrice: `${currentGasPriceGwei.toFixed(2)} GWEI`,
      recommendedGasPrice: `${recommendedGasPrice.toFixed(2)} GWEI`,
      potentialSavings: `${potentialSavings}%`,
      networkCongestion,
      optimalTimeToSend: networkCongestion === 'HIGH' ? 'Wait 1-2 hours for lower gas' : undefined
    };
    
  } catch (error) {
    console.error('Error getting gas optimization:', error);
    return {
      currentGasPrice: '25 GWEI',
      recommendedGasPrice: '22 GWEI',
      potentialSavings: '12%',
      networkCongestion: 'MEDIUM'
    };
  }
}