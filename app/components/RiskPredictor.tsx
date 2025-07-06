'use client';
import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Loader2, 
  Zap, 
  TrendingUp,
  Clock,
  DollarSign,
  AlertCircle,
  Search,
  ArrowRight,
  Target,
  BarChart3
} from 'lucide-react';
import { TransactionRiskAnalysis } from '../types/risk';

interface RiskPredictorProps {
  onAnalysisComplete?: (analysis: TransactionRiskAnalysis) => void;
}

const RiskPredictor: React.FC<RiskPredictorProps> = ({ onAnalysisComplete }) => {
  const [toAddress, setToAddress] = useState('');
  const [fromAddress, setFromAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<TransactionRiskAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Real-time analysis as user types (debounced)
  useEffect(() => {
    if (!toAddress || toAddress.length < 10) return;

    const timer = setTimeout(() => {
      performRiskAnalysis();
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(timer);
  }, [toAddress, fromAddress, amount]);

  const performRiskAnalysis = async () => {
    if (!toAddress) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/risk-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toAddress,
          fromAddress: fromAddress || undefined,
          amount: amount || undefined,
          chainId: 747 // Flow EVM Mainnet
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const result: TransactionRiskAnalysis = await response.json();
      setAnalysis(result);
      onAnalysisComplete?.(result);

    } catch (err) {
      console.error('Risk analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze risk');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (category: string) => {
    switch (category) {
      case 'LOW': return 'emerald';
      case 'MEDIUM': return 'yellow';
      case 'HIGH': return 'orange';
      case 'CRITICAL': return 'red';
      default: return 'gray';
    }
  };

  const getRiskIcon = (category: string) => {
    switch (category) {
      case 'LOW': return <CheckCircle className="w-5 h-5" />;
      case 'MEDIUM': return <AlertCircle className="w-5 h-5" />;
      case 'HIGH': return <AlertTriangle className="w-5 h-5" />;
      case 'CRITICAL': return <Shield className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 p-6 shadow-xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              AI Risk Prediction
            </h2>
            <p className="text-gray-600">Analyze transaction safety BEFORE you send</p>
          </div>
        </div>

        {/* Transaction Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">To Address</label>
            <div className="relative">
              <input
                type="text"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm"
              />
              <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">From Address (Optional)</label>
            <input
              type="text"
              value={fromAddress}
              onChange={(e) => setFromAddress(e.target.value)}
              placeholder="Your address (optional)"
              className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Amount (FLOW)</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                step="0.001"
                className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <DollarSign className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Analyze Button */}
        <button
          onClick={performRiskAnalysis}
          disabled={!toAddress || isAnalyzing}
          className="mt-4 w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Target className="w-5 h-5" />
              <span>Analyze Risk</span>
            </>
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-red-700 font-semibold">Analysis Failed</span>
          </div>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Risk Overview */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Risk Assessment</h3>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-${getRiskColor(analysis.overallRisk.category)}-100 border border-${getRiskColor(analysis.overallRisk.category)}-200`}>
                <div className={`text-${getRiskColor(analysis.overallRisk.category)}-600`}>
                  {getRiskIcon(analysis.overallRisk.category)}
                </div>
                <span className={`font-bold text-${getRiskColor(analysis.overallRisk.category)}-800`}>
                  {analysis.overallRisk.category} RISK
                </span>
              </div>
            </div>

            {/* Risk Score */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Risk Score</span>
                <span className="text-lg font-bold">{analysis.overallRisk.overall}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-3 rounded-full transition-all duration-1000 bg-gradient-to-r from-${getRiskColor(analysis.overallRisk.category)}-400 to-${getRiskColor(analysis.overallRisk.category)}-600`}
                  style={{ width: `${analysis.overallRisk.overall}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Safe</span>
                <span>Risky</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900">{analysis.overallRisk.confidence}%</div>
                <div className="text-xs text-gray-600">Confidence</div>
              </div>
              <div className="text-center p-3 bg-teal-50 rounded-xl">
                <div className="text-2xl font-bold text-teal-900">{analysis.toAddress.transactionCount}</div>
                <div className="text-xs text-teal-600">TX History</div>
              </div>
              <div className="text-center p-3 bg-emerald-50 rounded-xl">
                <div className="text-2xl font-bold text-emerald-900">{parseFloat(analysis.toAddress.balance).toFixed(3)}</div>
                <div className="text-xs text-emerald-600">FLOW Balance</div>
              </div>
              <div className="text-center p-3 bg-cyan-50 rounded-xl">
                <div className="text-2xl font-bold text-cyan-900">{analysis.toAddress.isContract ? 'Contract' : 'EOA'}</div>
                <div className="text-xs text-cyan-600">Address Type</div>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {analysis.warnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h4 className="font-bold text-amber-900">Security Warnings</h4>
              </div>
              <div className="space-y-2">
                {analysis.warnings.map((warning, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-amber-100 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span className="text-amber-800 text-sm">{warning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-gray-900">AI Recommendations</h4>
            </div>
            <div className="space-y-2">
              {analysis.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-emerald-800 text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Gas Optimization */}
          {analysis.gasOptimization && (
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-5 h-5 text-teal-600" />
                <h4 className="font-bold text-gray-900">Gas Optimization</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-teal-50 rounded-xl text-center">
                  <div className="text-lg font-bold text-teal-900">{analysis.gasOptimization.currentGasPrice}</div>
                  <div className="text-xs text-teal-600">Current Price</div>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl text-center">
                  <div className="text-lg font-bold text-emerald-900">{analysis.gasOptimization.recommendedGasPrice}</div>
                  <div className="text-xs text-emerald-600">Recommended</div>
                </div>
                <div className="p-4 bg-cyan-50 rounded-xl text-center">
                  <div className="text-lg font-bold text-cyan-900">{analysis.gasOptimization.potentialSavings}</div>
                  <div className="text-xs text-cyan-600">Potential Savings</div>
                </div>
              </div>
              {analysis.gasOptimization.optimalTimeToSend && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-3">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span className="text-yellow-800 text-sm">{analysis.gasOptimization.optimalTimeToSend}</span>
                </div>
              )}
            </div>
          )}

          {/* Risk Factors */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-5 h-5 text-gray-600" />
              <h4 className="font-bold text-gray-900">Risk Factor Analysis</h4>
            </div>
            <div className="space-y-3">
              {analysis.overallRisk.factors.map((factor, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{factor.type.replace(/_/g, ' ')}</div>
                    <div className="text-xs text-gray-600">{factor.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold bg-${getRiskColor(factor.severity)}-100 text-${getRiskColor(factor.severity)}-700`}>
                      {factor.severity}
                    </span>
                    <span className="text-sm font-bold">{factor.score}/100</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskPredictor;