'use client';
import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Loader2,
  Activity,
  TrendingUp,
  Zap,
  Hash,
  ExternalLink,
  Filter,
  Calendar,
  BarChart3,
  Target,
  Bot,
  AlertCircle
} from 'lucide-react';
import { AddressTimeline, TimelineEvent } from '../types/risk';
import { formatAddress } from '../utils/formatUtils';

interface TransactionTimelineProps {
  address: string;
  onEventSelect?: (event: TimelineEvent) => void;
  shouldAnalyze?: boolean;
}

const TransactionTimeline: React.FC<TransactionTimelineProps> = ({ 
  address, 
  onEventSelect,
  shouldAnalyze = false
}) => {
  const [timeline, setTimeline] = useState<AddressTimeline | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'HIGH_RISK' | 'SEND' | 'RECEIVE' | 'CONTRACT'>('ALL');
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  useEffect(() => {
    if (address && shouldAnalyze) {
      fetchTimeline();
    }
  }, [address, shouldAnalyze]);

  const fetchTimeline = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/address-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          limit: 50,
          chainId: 747
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch timeline');
      }

      const result: AddressTimeline = await response.json();
      setTimeline(result);

    } catch (err) {
      console.error('Timeline fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load timeline');
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredEvents = () => {
    if (!timeline) return [];
    
    return timeline.events.filter(event => {
      switch (filter) {
        case 'HIGH_RISK':
          return event.riskLevel === 'HIGH' || event.riskLevel === 'MEDIUM';
        case 'SEND':
          return event.type === 'SEND';
        case 'RECEIVE':
          return event.type === 'RECEIVE';
        case 'CONTRACT':
          return event.type === 'CONTRACT_INTERACTION';
        default:
          return true;
      }
    });
  };

  const getEventIcon = (event: TimelineEvent) => {
    switch (event.type) {
      case 'SEND':
        return <ArrowUpRight className="w-4 h-4" />;
      case 'RECEIVE':
        return <ArrowDownLeft className="w-4 h-4" />;
      case 'CONTRACT_INTERACTION':
        return <Zap className="w-4 h-4" />;
      case 'TOKEN_TRANSFER':
        return <Target className="w-4 h-4" />;
      case 'NFT_TRANSFER':
        return <BarChart3 className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getEventColor = (event: TimelineEvent) => {
    if (event.status === 'FAILED') return 'red';
    
    switch (event.riskLevel) {
      case 'HIGH': return 'red';
      case 'MEDIUM': return 'yellow';
      case 'LOW': return 'emerald';
      default: return 'gray';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'HIGH': return <AlertTriangle className="w-4 h-4" />;
      case 'MEDIUM': return <AlertCircle className="w-4 h-4" />;
      case 'LOW': return <CheckCircle className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 p-8 shadow-xl">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading transaction timeline...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-red-700 font-semibold">Timeline Error</span>
          </div>
          <p className="text-red-600 mt-2">{error}</p>
          <button
            onClick={fetchTimeline}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!timeline) return null;

  const filteredEvents = getFilteredEvents();

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header & Summary */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Transaction Timeline
              </h2>
              <p className="text-gray-600">Address: {formatAddress(address)}</p>
            </div>
          </div>
          
          {/* Pattern Indicators */}
          <div className="flex items-center gap-3">
            {timeline.patterns.isBot && (
              <div className="flex items-center gap-2 px-3 py-2 bg-orange-100 border border-orange-200 rounded-xl">
                <Bot className="w-4 h-4 text-orange-600" />
                <span className="text-orange-700 text-sm font-semibold">Bot Activity</span>
              </div>
            )}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
              timeline.patterns.tradingBehavior === 'SUSPICIOUS' ? 'bg-red-100 border-red-200' :
              timeline.patterns.tradingBehavior === 'HIGH_FREQUENCY' ? 'bg-yellow-100 border-yellow-200' :
              'bg-green-100 border-green-200'
            }`}>
              <Activity className={`w-4 h-4 ${
                timeline.patterns.tradingBehavior === 'SUSPICIOUS' ? 'text-red-600' :
                timeline.patterns.tradingBehavior === 'HIGH_FREQUENCY' ? 'text-yellow-600' :
                'text-green-600'
              }`} />
              <span className={`text-sm font-semibold ${
                timeline.patterns.tradingBehavior === 'SUSPICIOUS' ? 'text-red-700' :
                timeline.patterns.tradingBehavior === 'HIGH_FREQUENCY' ? 'text-yellow-700' :
                'text-green-700'
              }`}>
                {timeline.patterns.tradingBehavior.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-xl">
            <div className="text-2xl font-bold text-blue-900">{timeline.summary.totalTransactions}</div>
            <div className="text-xs text-blue-600">Total TXs</div>
          </div>
          <div className="text-center p-3 bg-emerald-50 rounded-xl">
            <div className="text-2xl font-bold text-emerald-900">{timeline.summary.totalVolume.split(' ')[0].slice(0, 6)}</div>
            <div className="text-xs text-emerald-600">Volume (FLOW)</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-xl">
            <div className="text-2xl font-bold text-red-900">{timeline.summary.riskEvents}</div>
            <div className="text-xs text-red-600">Risk Events</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-xl">
            <div className="text-2xl font-bold text-purple-900">{timeline.patterns.regularityScore}%</div>
            <div className="text-xs text-purple-600">Regularity</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-gray-900">{timeline.summary.averageGasPrice.split(' ')[0]}</div>
            <div className="text-xs text-gray-600">Avg Gas</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mt-6 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">Filter:</span>
          </div>
          {['ALL', 'HIGH_RISK', 'SEND', 'RECEIVE', 'CONTRACT'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption as any)}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                filter === filterOption
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filterOption.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Pattern Analysis */}
      {timeline.patterns.suspiciousPatterns.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h4 className="font-bold text-amber-900">Suspicious Patterns Detected</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {timeline.patterns.suspiciousPatterns.map((pattern, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-amber-100 rounded-xl">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="text-amber-800 text-sm">{pattern}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline Events */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-5 h-5 text-gray-600" />
          <h3 className="text-xl font-bold text-gray-900">
            Transaction History ({filteredEvents.length} events)
          </h3>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No transactions found for the selected filter.
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredEvents.map((event, index) => {
              const color = getEventColor(event);
              const isExpanded = expandedEvent === event.txHash;
              
              return (
                <div
                  key={event.txHash}
                  className={`relative pl-8 pb-4 ${
                    index !== filteredEvents.length - 1 ? 'border-l-2 border-gray-200' : ''
                  }`}
                >
                  {/* Timeline dot */}
                  <div className={`absolute left-0 top-2 w-3 h-3 bg-${color}-500 border-2 border-white rounded-full transform -translate-x-1/2 shadow-lg`} />
                  
                  {/* Event content */}
                  <div 
                    className={`bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer ${
                      isExpanded ? 'shadow-lg' : ''
                    }`}
                    onClick={() => {
                      setExpandedEvent(isExpanded ? null : event.txHash);
                      onEventSelect?.(event);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 bg-${color}-100 rounded-lg text-${color}-600`}>
                          {getEventIcon(event)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{event.description}</div>
                          <div className="text-sm text-gray-500">
                            {event.timestamp.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {event.amount && parseFloat(event.amount) > 0 && (
                          <div className="text-right">
                            <div className="font-bold text-gray-900">
                              {parseFloat(event.amount).toFixed(4)} {event.token || 'FLOW'}
                            </div>
                            <div className="text-xs text-gray-500">
                              Gas: {event.gasPrice}
                            </div>
                          </div>
                        )}
                        
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-${color}-100`}>
                          <div className={`text-${color}-600`}>
                            {getRiskIcon(event.riskLevel)}
                          </div>
                          <span className={`text-xs font-semibold text-${color}-700`}>
                            {event.riskLevel}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-semibold text-gray-700">Transaction Hash:</span>
                            <div className="font-mono text-gray-600 flex items-center gap-2">
                              {formatAddress(event.txHash)}
                              <ExternalLink className="w-3 h-3 text-gray-400" />
                            </div>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">Counterparty:</span>
                            <div className="font-mono text-gray-600">{formatAddress(event.counterparty)}</div>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">Gas Used:</span>
                            <div className="text-gray-600">{Number(event.gasUsed).toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">Status:</span>
                            <div className={`font-semibold ${
                              event.status === 'SUCCESS' ? 'text-green-600' :
                              event.status === 'FAILED' ? 'text-red-600' : 'text-yellow-600'
                            }`}>
                              {event.status}
                            </div>
                          </div>
                        </div>
                        
                        {/* Quick actions */}
                        <div className="flex gap-3 pt-2">
                          <button className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm">
                            <Hash className="w-3 h-3" />
                            View Details
                          </button>
                          <button className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                            <Shield className="w-3 h-3" />
                            Analyze Risk
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Risk Factors Summary */}
      {timeline.patterns.riskFactors.length > 0 && (
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-red-600" />
            <h4 className="font-bold text-gray-900">Risk Factor Analysis</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {timeline.patterns.riskFactors.map((factor, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-200">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-red-800 text-sm">{factor}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionTimeline;