import { NextRequest, NextResponse } from 'next/server';
import { analyzeAddressRisk, getGasOptimization } from '../../utils/riskAnalysis';
import { TransactionRiskAnalysis, RiskScore } from '../../types/risk';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const { fromAddress, toAddress, amount, chainId = 747 } = await request.json();

    // Validate inputs
    if (!toAddress) {
      return NextResponse.json(
        { error: 'toAddress is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`🔍 Analyzing transaction risk: ${fromAddress || 'unknown'} -> ${toAddress}`);

    // Analyze both addresses in parallel for better performance
    const [toAddressAnalysis, fromAddressAnalysis, gasOptimization] = await Promise.all([
      analyzeAddressRisk(toAddress),
      fromAddress ? analyzeAddressRisk(fromAddress) : Promise.resolve(null),
      getGasOptimization()
    ]);

    // Calculate overall transaction risk
    const overallRisk = calculateOverallTransactionRisk(
      fromAddressAnalysis,
      toAddressAnalysis,
      amount
    );

    // Generate AI-powered recommendations
    const recommendations = await generateAIRecommendations({
      fromAddress: fromAddressAnalysis,
      toAddress: toAddressAnalysis,
      amount,
      overallRisk
    });

    // Generate warnings based on risk analysis
    const warnings = generateWarnings(fromAddressAnalysis, toAddressAnalysis, overallRisk);

    const result: TransactionRiskAnalysis = {
      fromAddress: fromAddressAnalysis || {
        address: fromAddress || 'unknown',
        isContract: false,
        transactionCount: 0,
        balance: '0',
        riskScore: { overall: 0, confidence: 0, category: 'LOW', factors: [] },
        flags: []
      },
      toAddress: toAddressAnalysis,
      amount: amount || '0',
      estimatedGas: '21000', // Base gas for simple transfer
      gasOptimization,
      overallRisk,
      recommendations,
      warnings
    };

    return NextResponse.json(result, { headers: corsHeaders });

  } catch (error) {
    console.error('Risk analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze transaction risk',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * Calculate overall transaction risk based on both addresses
 */
function calculateOverallTransactionRisk(
  fromAnalysis: any,
  toAnalysis: any,
  amount?: string
): RiskScore {
  const toRisk = toAnalysis.riskScore.overall;
  const fromRisk = fromAnalysis?.riskScore.overall || 0;
  
  // Weight the recipient address risk higher (70% vs 30%)
  const weightedRisk = (toRisk * 0.7) + (fromRisk * 0.3);
  
  // Add amount-based risk factors
  let amountRisk = 0;
  if (amount) {
    const amountNum = parseFloat(amount);
    if (amountNum > 1000) amountRisk = 20; // Large amounts increase risk
    else if (amountNum > 100) amountRisk = 10;
  }
  
  const finalRisk = Math.min(100, weightedRisk + amountRisk);
  
  // Combine risk factors from both addresses
  const allFactors = [
    ...(toAnalysis.riskScore.factors || []),
    ...(fromAnalysis?.riskScore.factors || [])
  ];
  
  return {
    overall: finalRisk,
    confidence: Math.min(toAnalysis.riskScore.confidence, fromAnalysis?.riskScore.confidence || 100),
    category: categorizeRisk(finalRisk),
    factors: allFactors
  };
}

/**
 * Generate AI-powered recommendations
 */
async function generateAIRecommendations(data: {
  fromAddress: any;
  toAddress: any;
  amount?: string;
  overallRisk: RiskScore;
}): Promise<string[]> {
  try {
    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
You are a blockchain security expert analyzing a Flow EVM transaction. Based on the following data, provide 3-5 concise, actionable recommendations:

To Address Risk: ${data.toAddress.riskScore.overall}/100 (${data.toAddress.riskScore.category})
From Address Risk: ${data.fromAddress?.riskScore.overall || 0}/100
Amount: ${data.amount || 'Unknown'} FLOW
Contract: ${data.toAddress.isContract ? 'Yes' : 'No'}
Verified: ${data.toAddress.isVerified ? 'Yes' : 'No'}

Risk Factors:
${data.overallRisk.factors.map(f => `- ${f.type}: ${f.description}`).join('\n')}

Provide recommendations as a JSON array of strings. Focus on:
1. Security actions
2. Gas optimization
3. Transaction timing
4. Alternative approaches if high risk

Return only the JSON array, no other text.`;

    const response = await generateText({
      model: openai('gpt-4'),
      prompt,
      maxTokens: 300,
    });

    try {
      return JSON.parse(response.text);
    } catch {
      // Fallback recommendations if AI fails
      return generateFallbackRecommendations(data.overallRisk);
    }

  } catch (error) {
    console.error('AI recommendation error:', error);
    return generateFallbackRecommendations(data.overallRisk);
  }
}

/**
 * Generate fallback recommendations
 */
function generateFallbackRecommendations(risk: RiskScore): string[] {
  const recommendations: string[] = [];
  
  if (risk.overall >= 80) {
    recommendations.push('⚠️ High risk detected - Consider avoiding this transaction');
    recommendations.push('🔍 Verify the recipient address through official channels');
    recommendations.push('💰 Start with a small test amount if you must proceed');
  } else if (risk.overall >= 60) {
    recommendations.push('⚡ Moderate risk - Proceed with caution');
    recommendations.push('✅ Double-check the recipient address');
    recommendations.push('⏰ Consider waiting for network congestion to decrease');
  } else {
    recommendations.push('✅ Low risk transaction');
    recommendations.push('⛽ Current gas prices are optimal');
    recommendations.push('🚀 Safe to proceed');
  }
  
  return recommendations;
}

/**
 * Generate warnings based on risk analysis
 */
function generateWarnings(fromAnalysis: any, toAnalysis: any, overallRisk: RiskScore): string[] {
  const warnings: string[] = [];
  
  // Contract-specific warnings
  if (toAnalysis.isContract && !toAnalysis.isVerified) {
    warnings.push('🚨 Unverified smart contract - source code not audited');
  }
  
  // High-risk warnings
  if (overallRisk.overall >= 80) {
    warnings.push('⛔ CRITICAL RISK: Multiple suspicious factors detected');
  }
  
  // New address warnings
  if (toAnalysis.transactionCount === 0) {
    warnings.push('🆕 NEW ADDRESS: No transaction history available');
  }
  
  // Balance warnings
  if (parseFloat(toAnalysis.balance) === 0 && toAnalysis.transactionCount > 0) {
    warnings.push('💸 Empty wallet with transaction history - possible drained account');
  }
  
  // Pattern warnings
  const suspiciousFactors = overallRisk.factors.filter(f => f.severity === 'CRITICAL' || f.severity === 'HIGH');
  if (suspiciousFactors.length >= 2) {
    warnings.push('🔍 Multiple high-risk patterns detected - investigate before proceeding');
  }
  
  return warnings;
}

/**
 * Categorize risk level
 */
function categorizeRisk(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
}