'use client';
import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Zap,
  Clock,
  Users,
  BarChart3
} from 'lucide-react';

interface NetworkData {
  latestBlock: number;
  gasPrice: string;
  totalTransactions: number;
  avgBlockTime: number;
}

interface RealTimeMetricsProps {
  networkData: NetworkData;
  isConnected: boolean;
}

const RealTimeMetrics: React.FC<RealTimeMetricsProps> = ({ networkData, isConnected }) => {
  const [previousData, setPreviousData] = useState<NetworkData | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [trends, setTrends] = useState({
    blockTrend: 'stable' as 'up' | 'down' | 'stable',
    gasTrend: 'stable' as 'up' | 'down' | 'stable',
    txTrend: 'stable' as 'up' | 'down' | 'stable',
    timeTrend: 'stable' as 'up' | 'down' | 'stable'
  });

  // Fix hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (previousData && networkData) {
      setTrends({
        blockTrend: networkData.latestBlock > previousData.latestBlock ? 'up' : 
                   networkData.latestBlock < previousData.latestBlock ? 'down' : 'stable',
        gasTrend: parseFloat(networkData.gasPrice) > parseFloat(previousData.gasPrice) ? 'up' :
                  parseFloat(networkData.gasPrice) < parseFloat(previousData.gasPrice) ? 'down' : 'stable',
        txTrend: networkData.totalTransactions > previousData.totalTransactions ? 'up' :
                networkData.totalTransactions < previousData.totalTransactions ? 'down' : 'stable',
        timeTrend: networkData.avgBlockTime > previousData.avgBlockTime ? 'up' :
                  networkData.avgBlockTime < previousData.avgBlockTime ? 'down' : 'stable'
      });
    }
    setPreviousData(networkData);
  }, [networkData]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-emerald-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Real-time activity animation
  const [activityPulse, setActivityPulse] = useState(false);
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        setActivityPulse(prev => !prev);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Latest Block */}
      <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl border border-emerald-100/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 to-transparent"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <BarChart3 className="w-6 h-6 text-emerald-600" />
            </div>
            {getTrendIcon(trends.blockTrend)}
          </div>
          <div className="text-sm font-semibold text-gray-600 mb-1">Latest Block</div>
          <div className={`text-2xl font-bold transition-colors duration-300 ${getTrendColor(trends.blockTrend)}`}>
            {networkData.latestBlock.toString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {isConnected && (
              <div className={`inline-flex items-center gap-1 ${activityPulse ? 'opacity-100' : 'opacity-60'} transition-opacity duration-500`}>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="font-semibold text-emerald-600">Live</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gas Price */}
      <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl border border-teal-100/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/30 to-transparent"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-teal-100 rounded-xl">
              <Zap className="w-6 h-6 text-teal-600" />
            </div>
            {getTrendIcon(trends.gasTrend)}
          </div>
          <div className="text-sm font-semibold text-gray-600 mb-1">Gas Price</div>
          <div className={`text-2xl font-bold transition-colors duration-300 ${getTrendColor(trends.gasTrend)}`}>
            {parseFloat(networkData.gasPrice) < 0.000001 ? 
              (parseFloat(networkData.gasPrice) * 1e9).toFixed(2) + ' GWEI' : 
              parseFloat(networkData.gasPrice).toFixed(6)
            }
          </div>
          <div className="text-xs text-teal-600 font-medium mt-1">
            {parseFloat(networkData.gasPrice) < 0.000001 ? '' : 'FLOW'}
          </div>
        </div>
      </div>

      {/* Total Transactions */}
      <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl border border-cyan-100/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/30 to-transparent"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-cyan-100 rounded-xl">
              <Users className="w-6 h-6 text-cyan-600" />
            </div>
            {getTrendIcon(trends.txTrend)}
          </div>
          <div className="text-sm font-semibold text-gray-600 mb-1">Transactions</div>
          <div className={`text-2xl font-bold transition-colors duration-300 ${getTrendColor(trends.txTrend)}`}>
            {networkData.totalTransactions}
          </div>
          <div className="text-xs text-gray-500 mt-1">Recent blocks</div>
        </div>
      </div>

      {/* Average Block Time */}
      <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl border border-purple-100/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-transparent"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            {getTrendIcon(trends.timeTrend)}
          </div>
          <div className="text-sm font-semibold text-gray-600 mb-1">Avg Block Time</div>
          <div className={`text-2xl font-bold transition-colors duration-300 ${getTrendColor(trends.timeTrend)}`}>
            {networkData.avgBlockTime ? `${networkData.avgBlockTime.toFixed(1)}s` : 'N/A'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {networkData.avgBlockTime > 0 && (
              <span className={`font-semibold ${
                networkData.avgBlockTime < 10 ? 'text-emerald-600' :
                networkData.avgBlockTime < 15 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {networkData.avgBlockTime < 10 ? 'Excellent' :
                 networkData.avgBlockTime < 15 ? 'Good' : 'Slow'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeMetrics;