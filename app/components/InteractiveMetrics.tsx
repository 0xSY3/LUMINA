'use client';
import React, { useEffect, useState, useRef } from 'react';
import { 
  Activity, 
  TrendingUp, 
  Zap, 
  BarChart3, 
  PieChart, 
  LineChart,
  Target,
  Shield,
  Clock,
  Gauge
} from 'lucide-react';

interface MetricsData {
  networkMetrics?: any;
  networkIntelligence?: any;
  flowSpecificFeatures?: any;
  mevIndicators?: any[];
  gasAnalysis?: any;
  patterns?: any;
}

interface InteractiveMetricsProps {
  data: MetricsData;
  isVisible: boolean;
}

const InteractiveMetrics: React.FC<InteractiveMetricsProps> = ({ data, isVisible }) => {
  const [selectedTab, setSelectedTab] = useState('network');
  const [isClient, setIsClient] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isVisible || !data) return null;

  // Real-time Gas Price Chart Component
  const GasPriceChart = ({ prediction }: { prediction: any }) => {
    const prices = prediction?.gasPrices || [];
    const confidence = prediction?.confidence || 0;
    
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-xl">
              <LineChart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Gas Price Trends</h3>
              <p className="text-sm text-gray-600">Real-time prediction</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Confidence</div>
            <div className="text-lg font-bold text-emerald-600">{confidence}%</div>
          </div>
        </div>
        
        <div className="relative h-32 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 overflow-hidden">
          <div className="absolute inset-0 flex items-end justify-between px-2">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                className="bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-lg opacity-80 transition-all duration-500 hover:opacity-100"
                style={{ 
                  height: `${Math.random() * 80 + 20}%`,
                  width: '8px',
                  animationDelay: `${i * 100}ms`
                }}
              />
            ))}
          </div>
          <div className="relative z-10 text-xs text-gray-600 flex justify-between items-end h-full">
            <span>-5h</span>
            <span>Now</span>
            <span>+1h</span>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="bg-emerald-50 rounded-xl p-3">
            <div className="text-xs text-gray-600">Next Hour</div>
            <div className="text-sm font-bold text-emerald-600">
              {prediction?.nextHourPrediction || 'Stable'}
            </div>
          </div>
          <div className="bg-teal-50 rounded-xl p-3">
            <div className="text-xs text-gray-600">24h Trend</div>
            <div className="text-sm font-bold text-teal-600">
              {prediction?.next24HourTrend || 'Stable'}
            </div>
          </div>
          <div className="bg-cyan-50 rounded-xl p-3">
            <div className="text-xs text-gray-600">Optimal</div>
            <div className="text-sm font-bold text-cyan-600">
              {prediction?.optimalGasPrice || '0'} GWEI
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Network Health Gauge
  const NetworkHealthGauge = ({ health }: { health: any }) => {
    const score = health?.score || 85;
    const rotation = (score / 100) * 180 - 90;
    
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-600 rounded-xl">
            <Gauge className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Network Health</h3>
            <p className="text-sm text-gray-600">Real-time assessment</p>
          </div>
        </div>
        
        <div className="relative w-48 h-24 mx-auto mb-4">
          <svg viewBox="0 0 200 100" className="w-full h-full">
            {/* Background arc */}
            <path
              d="M 20 80 A 80 80 0 0 1 180 80"
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Progress arc */}
            <path
              d="M 20 80 A 80 80 0 0 1 180 80"
              fill="none"
              stroke="url(#healthGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 251} 251`}
              className="transition-all duration-1000"
            />
            {/* Needle */}
            <line
              x1="100"
              y1="80"
              x2="100"
              y2="30"
              stroke="#374151"
              strokeWidth="2"
              strokeLinecap="round"
              transform={`rotate(${rotation} 100 80)`}
              className="transition-transform duration-1000"
            />
            <circle cx="100" cy="80" r="4" fill="#374151" />
            
            <defs>
              <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center mt-8">
              <div className="text-2xl font-bold text-gray-900">{score}</div>
              <div className="text-xs text-gray-600">/ 100</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          {health?.factors?.slice(0, 3).map((factor: string, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span className="text-gray-700">{factor}</span>
            </div>
          ))}
          {health?.warnings?.slice(0, 2).map((warning: string, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
              <span className="text-gray-700">{warning}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // MEV Risk Radar
  const MEVRiskRadar = ({ indicators }: { indicators: any[] }) => {
    const riskTypes = ['Sandwich', 'Arbitrage', 'Flash Loan', 'Front-run', 'Bot Activity'];
    const riskScores = riskTypes.map(type => {
      const indicator = indicators?.find(ind => ind.type.toLowerCase().includes(type.toLowerCase()));
      return indicator ? (indicator.confidence || 50) : 0;
    });
    
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-600 rounded-xl">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">MEV Risk Analysis</h3>
            <p className="text-sm text-gray-600">Multi-vector detection</p>
          </div>
        </div>
        
        <div className="relative w-48 h-48 mx-auto mb-4">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {/* Grid circles */}
            {[1, 2, 3, 4, 5].map(i => (
              <circle
                key={i}
                cx="100"
                cy="100"
                r={i * 18}
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="1"
              />
            ))}
            
            {/* Grid lines */}
            {riskTypes.map((_, i) => {
              const angle = (i * 72 - 90) * (Math.PI / 180);
              const x2 = 100 + Math.cos(angle) * 90;
              const y2 = 100 + Math.sin(angle) * 90;
              return (
                <line
                  key={i}
                  x1="100"
                  y1="100"
                  x2={x2}
                  y2={y2}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                />
              );
            })}
            
            {/* Risk polygon */}
            <polygon
              points={riskScores.map((score, i) => {
                const angle = (i * 72 - 90) * (Math.PI / 180);
                const radius = (score / 100) * 90;
                const x = 100 + Math.cos(angle) * radius;
                const y = 100 + Math.sin(angle) * radius;
                return `${x},${y}`;
              }).join(' ')}
              fill="rgba(239, 68, 68, 0.2)"
              stroke="#ef4444"
              strokeWidth="2"
            />
            
            {/* Risk points */}
            {riskScores.map((score, i) => {
              const angle = (i * 72 - 90) * (Math.PI / 180);
              const radius = (score / 100) * 90;
              const x = 100 + Math.cos(angle) * radius;
              const y = 100 + Math.sin(angle) * radius;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#ef4444"
                  className="hover:r-6 transition-all duration-200"
                />
              );
            })}
          </svg>
        </div>
        
        <div className="grid grid-cols-1 gap-2 text-sm">
          {riskTypes.map((type, i) => (
            <div key={type} className="flex items-center justify-between">
              <span className="text-gray-700">{type}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-red-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${riskScores[i]}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 w-8">{riskScores[i]}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Flow-Specific Features Visualization
  const FlowFeaturesVisualization = ({ features }: { features: any }) => {
    const crossChainData = features?.crossChain;
    const cadenceData = features?.cadenceIntegration;
    const ecosystemData = features?.flowEcosystem;
    
    return (
      <div className="space-y-6">
        {/* Cross-Chain Activity */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-600 rounded-xl">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Cross-Chain Activity</h3>
              <p className="text-sm text-gray-600">Bridge detection & volume</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
              <div className="text-xs text-gray-600 mb-1">Detection Status</div>
              <div className={`text-lg font-bold ${crossChainData?.detected ? 'text-purple-600' : 'text-gray-500'}`}>
                {crossChainData?.detected ? 'Detected' : 'None'}
              </div>
              <div className="text-xs text-gray-600">
                {crossChainData?.bridges?.length || 0} bridges found
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
              <div className="text-xs text-gray-600 mb-1">Volume</div>
              <div className="text-lg font-bold text-blue-600">
                {parseFloat(crossChainData?.crossChainVolume || '0').toFixed(2)}
              </div>
              <div className="text-xs text-gray-600">FLOW tokens</div>
            </div>
          </div>
          
          {crossChainData?.targetChains?.length > 0 && (
            <div className="mt-4">
              <div className="text-xs text-gray-600 mb-2">Target Chains</div>
              <div className="flex flex-wrap gap-2">
                {crossChainData.targetChains.map((chain: string) => (
                  <span key={chain} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                    {chain}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cadence Integration */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-600 rounded-xl">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Cadence Integration</h3>
              <p className="text-sm text-gray-600">Flow-native features</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Features Used</span>
                <span className="text-lg font-bold text-emerald-600">
                  {cadenceData?.featuresUsed || 0}
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-emerald-400 to-teal-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((cadenceData?.featuresUsed || 0) * 20, 100)}%` }}
                />
              </div>
            </div>
            
            {cadenceData?.resourcesDetected?.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs text-gray-600">Resources Detected</div>
                {cadenceData.resourcesDetected.slice(0, 3).map((resource: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <span className="text-gray-700">{resource}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ecosystem Health */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-600 rounded-xl">
              <PieChart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Flow Ecosystem</h3>
              <p className="text-sm text-gray-600">DApp categorization</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
              <div className="text-xs text-gray-600 mb-1">Category</div>
              <div className="text-lg font-bold text-blue-600">
                {ecosystemData?.dappCategory || 'Unknown'}
              </div>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4">
              <div className="text-xs text-gray-600 mb-1">Health</div>
              <div className="text-lg font-bold text-indigo-600">
                {ecosystemData?.ecosystemHealth || 'Good'}
              </div>
            </div>
          </div>
          
          {ecosystemData?.popularProtocols?.length > 0 && (
            <div className="mt-4">
              <div className="text-xs text-gray-600 mb-2">Protocols Detected</div>
              <div className="flex flex-wrap gap-2">
                {ecosystemData.popularProtocols.map((protocol: string) => (
                  <span key={protocol} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                    {protocol}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'network', label: 'Network Intelligence', icon: Activity },
    { id: 'gas', label: 'Gas Analytics', icon: TrendingUp },
    { id: 'mev', label: 'MEV Analysis', icon: Zap },
    { id: 'flow', label: 'Flow Features', icon: Shield }
  ];

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-emerald-100/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-600 rounded-xl">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-emerald-600">Interactive Analytics Dashboard</h2>
            <p className="text-sm text-gray-600">Real-time metrics and visualizations</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-100 bg-white/60 backdrop-blur-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 ${
                selectedTab === tab.id
                  ? 'border-emerald-500 text-emerald-600 bg-emerald-50/50'
                  : 'border-transparent text-gray-600 hover:text-emerald-600 hover:bg-emerald-50/30'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {selectedTab === 'network' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NetworkHealthGauge health={data.networkIntelligence?.networkHealth} />
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-600 rounded-xl">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Network Trends</h3>
                  <p className="text-sm text-gray-600">Real-time activity</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {Object.entries(data.networkIntelligence?.trends || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span className="text-sm font-bold text-emerald-600">{value as string}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'gas' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GasPriceChart prediction={data.networkIntelligence?.gasPrediction} />
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-600 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Gas Optimization</h3>
                  <p className="text-sm text-gray-600">Efficiency analysis</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4">
                  <div className="text-xs text-gray-600 mb-1">Efficiency Rating</div>
                  <div className="text-xl font-bold text-emerald-600">
                    {data.gasAnalysis?.efficiency || 'Unknown'}
                  </div>
                </div>
                
                {data.gasAnalysis?.recommendations?.map((rec: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                    <span className="text-sm text-gray-700">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'mev' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MEVRiskRadar indicators={data.mevIndicators || []} />
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-600 rounded-xl">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">MEV Indicators</h3>
                  <p className="text-sm text-gray-600">Detected patterns</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {data.mevIndicators?.slice(0, 4).map((indicator, index) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{indicator.type}</span>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        indicator.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                        indicator.severity === 'High' ? 'bg-orange-100 text-orange-700' :
                        indicator.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {indicator.severity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{indicator.description}</p>
                  </div>
                )) || (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                    <p className="text-gray-600">No MEV indicators detected</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'flow' && (
          <FlowFeaturesVisualization features={data.flowSpecificFeatures} />
        )}
      </div>
    </div>
  );
};

export default InteractiveMetrics;