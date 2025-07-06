'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useChat } from 'ai/react';
import { createPublicClient, http, formatEther, defineChain } from 'viem';
import { 
  Search, 
  Loader2, 
  RefreshCw, 
  AlertTriangle, 
  ArrowRight, 
  Blocks,
  Activity,
  Box,
  Clock,
  Hash,
  ChevronRight,
  Maximize2,
  ExternalLink,
  Zap,
  TrendingUp,
  Shield,
  Network,
  Sparkles,
  BarChart3,
  Users,
  Fuel,
  Globe
} from 'lucide-react';
import { formatAssistantMessage } from '../utils/messageFormatter';
import { formatAddress } from '../utils/formatUtils';
import MermaidDiagram from './MermaidDiagram';
import DiagramModal from './DiagramModal';
import { AnalysisDashboard } from './AnalysisDashboard';
import { 
  StatsCard, 
  TransactionCard, 
  BlockCard, 
  NetworkStatus, 
  ActivityFeed 
} from './Dashboard/StatsCard';

// Configure Flow EVM chains
const flowMainnet = defineChain({
  id: 747,
  name: 'Flow EVM Mainnet',
  nativeCurrency: { decimals: 18, name: 'Flow', symbol: 'FLOW' },
  rpcUrls: { default: { http: ['https://mainnet.evm.nodes.onflow.org'] }, public: { http: ['https://mainnet.evm.nodes.onflow.org'] } },
  blockExplorers: { default: { name: 'FlowScan', url: 'https://evm.flowscan.io' } },
});

const flowTestnet = defineChain({
  id: 545,
  name: 'Flow EVM Testnet',
  nativeCurrency: { decimals: 18, name: 'Flow', symbol: 'FLOW' },
  rpcUrls: { default: { http: ['https://testnet.evm.nodes.onflow.org'] }, public: { http: ['https://testnet.evm.nodes.onflow.org'] } },
  blockExplorers: { default: { name: 'FlowScan Testnet', url: 'https://evm-testnet.flowscan.io' } },
});

const ModernFlowExplorer: React.FC = () => {
  const [selectedNetwork, setSelectedNetwork] = useState<'mainnet' | 'testnet'>('mainnet');
  const [latestBlocks, setLatestBlocks] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [networkStats, setNetworkStats] = useState({
    latestBlock: 0,
    gasPrice: '0',
    totalTransactions: 0,
    avgBlockTime: 0,
    tps: 0,
  });
  const [isLoadingChainData, setIsLoadingChainData] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [selectedTxHash, setSelectedTxHash] = useState<string | null>(null);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [mermaidChart, setMermaidChart] = useState<string | null>(null);
  const [isDiagramModalOpen, setIsDiagramModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [retryCount, setRetryCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getCurrentChain = () => selectedNetwork === 'mainnet' ? flowMainnet : flowTestnet;
  const getCurrentClient = () => createPublicClient({
    chain: getCurrentChain(),
    transport: http(),
  });

  const { messages, input, handleInputChange, handleSubmit: chatHandleSubmit, isLoading, error, reload, setInput } = useChat({
    api: '/api/chat',
    id: selectedTxHash || undefined,
    body: {
      txHash: selectedTxHash,
      chainId: getCurrentChain().id
    },
    onFinish: (message) => {
      console.log('AI Analysis completed');
      
      // Extract mermaid chart
      const mermaidMatch = message.content.match(/```mermaid\n([\s\S]*?)\n```/);
      if (mermaidMatch) {
        setMermaidChart(mermaidMatch[1].trim());
        setCurrentMessage(message.content.replace(/```mermaid\n[\s\S]*?\n```/, '').trim());
      } else {
        setCurrentMessage(message.content);
        setMermaidChart(null);
      }

      // Try to parse analysis data from the message
      try {
        // This would need to be implemented based on your API response format
        const mockAnalysisData = {
          network: {
            name: getCurrentChain().name,
            chainId: getCurrentChain().id,
            currency: 'FLOW',
            blockNumber: networkStats.latestBlock,
            blockTimestamp: new Date().toISOString(),
            testnet: selectedNetwork === 'testnet'
          },
          transaction: {
            hash: selectedTxHash,
            from: '0x' + '1'.repeat(40),
            to: '0x' + '2'.repeat(40),
            value: '1.5',
            status: 'Success',
            gasUsed: '21000',
            gasPrice: '1.5',
            totalCost: '0.0315',
            nonce: 42
          },
          actionTypes: ['Native Transfer'],
          transfers: [],
          actions: [],
          interactions: [],
          securityInfo: [],
          summary: {
            totalTransfers: 1,
            uniqueTokens: 1,
            uniqueContracts: 0,
            complexityScore: 'Simple',
            riskLevel: 'Low'
          }
        };
        setAnalysisData(mockAnalysisData);
      } catch (error) {
        console.warn('Could not parse analysis data:', error);
      }

      // Add to activity feed
      setActivities(prev => [{
        id: Date.now().toString(),
        type: 'analysis',
        title: 'Transaction Analysis Complete',
        description: `Analyzed transaction ${selectedTxHash?.slice(0, 10)}...`,
        timestamp: new Date(),
      }, ...prev.slice(0, 9)]);
    },
    onError: (error) => {
      console.error('Chat error:', error);
    }
  });

  // Enhanced data fetching
  const fetchBlockchainData = async (isRetry = false) => {
    try {
      if (!isRetry) {
        setIsLoadingChainData(true);
        setIsRefreshing(true);
      }
      setConnectionStatus('connecting');
      
      const client = getCurrentClient();
      console.log(`🔍 Fetching data from ${getCurrentChain().name}...`);
      
      const blockNumberPromise = client.getBlockNumber();
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)
      );
      
      const blockNumber: bigint = await Promise.race([blockNumberPromise, timeoutPromise]);
      setConnectionStatus('connected');
      
      // Fetch blocks
      const blocksToFetch = 12;
      const blockPromises = Array.from({ length: blocksToFetch }, async (_, i) => {
        try {
          const targetBlock = blockNumber - BigInt(i);
          const block = await client.getBlock({
            blockNumber: targetBlock,
            includeTransactions: true,
          });
          return block;
        } catch (error: any) {
          console.warn(`Failed to fetch block ${blockNumber - BigInt(i)}`);
          return null;
        }
      });
      
      const blockResults = await Promise.allSettled(blockPromises);
      const blocks = blockResults
        .filter((result): result is PromiseFulfilledResult<any> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value)
        .filter(block => block && block.number);
      
      if (blocks.length === 0) {
        throw new Error('No blocks could be fetched');
      }
      
      setLatestBlocks(blocks);
      
      // Get gas price
      let gasPrice = 0n;
      try {
        gasPrice = await client.getGasPrice();
      } catch (error) {
        console.warn('Could not fetch gas price');
      }
      
      // Calculate network stats
      let avgBlockTime = 0;
      let tps = 0;
      if (blocks.length >= 2) {
        const timeDiffs = [];
        let totalTxs = 0;
        for (let i = 0; i < Math.min(blocks.length - 1, 5); i++) {
          const timeDiff = Number(blocks[i].timestamp) - Number(blocks[i + 1].timestamp);
          if (timeDiff > 0) {
            timeDiffs.push(timeDiff);
            totalTxs += blocks[i].transactions.length;
          }
        }
        avgBlockTime = timeDiffs.length > 0 ? 
          timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length : 0;
        tps = avgBlockTime > 0 ? totalTxs / (avgBlockTime * timeDiffs.length) : 0;
      }
      
      // Collect transactions
      const allTransactions = blocks.reduce((acc: any[], block: any) => {
        if (block?.transactions && Array.isArray(block.transactions)) {
          const validTxs = block.transactions.filter((tx: any) => 
            tx && tx.hash && tx.from && typeof tx.hash === 'string' && tx.hash.length === 66
          );
          return [...acc, ...validTxs];
        }
        return acc;
      }, []);

      const sortedTransactions = allTransactions
        .sort((a: any, b: any) => {
          const blockDiff = Number(b.blockNumber || 0) - Number(a.blockNumber || 0);
          if (blockDiff !== 0) return blockDiff;
          return Number(b.transactionIndex || 0) - Number(a.transactionIndex || 0);
        })
        .slice(0, 15);
      
      setRecentTransactions(sortedTransactions);
      
      setNetworkStats({
        latestBlock: Number(blockNumber),
        gasPrice: formatEther(gasPrice),
        totalTransactions: allTransactions.length,
        avgBlockTime: avgBlockTime,
        tps: tps,
      });
      
      setLastUpdateTime(new Date());
      setRetryCount(0);
      
      // Add activity
      setActivities(prev => [{
        id: Date.now().toString(),
        type: 'block',
        title: `New Block #${Number(blockNumber).toLocaleString()}`,
        description: `${blocks[0]?.transactions.length || 0} transactions`,
        timestamp: new Date(),
        trend: 'up'
      }, ...prev.slice(0, 9)]);

    } catch (error: any) {
      console.error('❌ Error fetching Flow data:', error);
      setConnectionStatus('error');
      
      if (retryCount < 3) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchBlockchainData(true), 3000);
      }
    } finally {
      setIsLoadingChainData(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setRetryCount(0);
    setLatestBlocks([]);
    setRecentTransactions([]);
    fetchBlockchainData();

    const interval = setInterval(() => {
      if (!isSearchMode && connectionStatus === 'connected') {
        fetchBlockchainData();
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [selectedNetwork]);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    if (!input.match(/^0x[a-fA-F0-9]{64}$/)) {
      alert('Please enter a valid transaction hash');
      return;
    }
    
    setIsSearchMode(true);
    setSelectedTxHash(input);
    setCurrentMessage(null);
    setMermaidChart(null);
    setAnalysisData(null);
    chatHandleSubmit(e);
  };

  const formRef = useRef<HTMLFormElement>(null);

  const handleSearch = (hash: string) => {
    setInput(hash);
    setIsSearchMode(true);
    setSelectedTxHash(hash);
    setCurrentMessage(null);
    setMermaidChart(null);
    setAnalysisData(null);

    requestAnimationFrame(() => {
      if (formRef.current) {
        formRef.current.requestSubmit();
      }
    });
  };

  const handleBackToExplorer = () => {
    setIsSearchMode(false);
    setSelectedTxHash(null);
    setCurrentMessage(null);
    setMermaidChart(null);
    setAnalysisData(null);
    setInput('');
  };

  const handleBlockClick = (block: any) => {
    if (block.transactions && block.transactions.length > 0) {
      const interestingTx = block.transactions.find((tx: any) => 
        (tx.value && tx.value > 0n) || (tx.data && tx.data !== '0x' && tx.data.length > 10)
      ) || block.transactions[0];
      
      if (interestingTx) {
        handleSearch(interestingTx.hash);
      }
    }
  };

  const handleManualRefresh = () => {
    setRetryCount(0);
    fetchBlockchainData();
  };

  const currentChain = getCurrentChain();
  const explorerUrl = currentChain.blockExplorers?.default.url;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                    FlowScanAI
                  </h1>
                  <p className="text-sm text-gray-600">AI-Powered Flow Explorer</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="hidden lg:flex items-center space-x-6 ml-8">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{networkStats.latestBlock.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Latest Block</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{networkStats.tps.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">TPS</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{networkStats.totalTransactions}</div>
                  <div className="text-xs text-gray-500">Transactions</div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Network Status */}
              <NetworkStatus 
                status={connectionStatus}
                network={currentChain.name}
                chainId={currentChain.id}
                lastUpdate={lastUpdateTime || undefined}
              />

              {/* Network Selector */}
              <select
                value={selectedNetwork}
                onChange={(e) => setSelectedNetwork(e.target.value as 'mainnet' | 'testnet')}
                className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              >
                <option value="mainnet">Flow Mainnet</option>
                <option value="testnet">Flow Testnet</option>
              </select>

              {/* External Links */}
              {explorerUrl && (
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                  title="Open FlowScan"
                >
                  <ExternalLink className="w-5 h-5 text-gray-600" />
                </a>
              )}

              {!isSearchMode && (
                <button 
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="p-2 hover:bg-white/50 rounded-lg transition-colors disabled:opacity-50"
                  title="Refresh data"
                >
                  <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Explore Flow with AI Intelligence
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Get deep insights into Flow blockchain transactions with AI-powered analysis
          </p>
          
          <form ref={formRef} onSubmit={handleFormSubmit} className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Enter transaction hash (0x...) for AI analysis"
              disabled={isLoading}
              className="w-full pl-14 pr-32 py-5 bg-white/95 backdrop-blur-md rounded-2xl border-0 focus:ring-4 focus:ring-white/30 shadow-xl text-lg"
            />
            <div className="absolute inset-y-0 right-2 flex items-center space-x-2">
              {isSearchMode && (
                <button
                  type="button"
                  onClick={handleBackToExplorer}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Back
                </button>
              )}
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Analyze</span>
                  </>
                )}
              </button>
            </div>
          </form>
          
          {error && (
            <div className="mt-6 max-w-lg mx-auto">
              <div className="bg-red-500/10 backdrop-blur-md border border-red-300/30 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <div className="text-red-200">
                    <div className="font-medium">Analysis failed</div>
                    <div className="text-sm opacity-80">Please check the transaction hash and try again</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isSearchMode ? (
          // Analysis Dashboard
          <div>
            {analysisData ? (
              <AnalysisDashboard
                data={analysisData}
                mermaidChart={mermaidChart || undefined}
                onViewDiagram={() => setIsDiagramModalOpen(true)}
                onViewExplorer={(hash) => window.open(`${explorerUrl}/tx/${hash}`, '_blank')}
              />
            ) : isLoading ? (
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-12 text-center">
                <div className="max-w-md mx-auto">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-500 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Transaction</h3>
                  <p className="text-gray-600">Our AI is examining the transaction details...</p>
                  <div className="mt-6 bg-blue-50 rounded-lg p-4">
                    <div className="text-sm text-blue-800">
                      Transaction: {selectedTxHash?.slice(0, 10)}...{selectedTxHash?.slice(-8)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-12 text-center">
                <AlertTriangle className="w-12 h-12 mx-auto text-orange-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Analysis Pending</h3>
                <p className="text-gray-600">Waiting for analysis results...</p>
              </div>
            )}
            </div>
        ) : (
          // Modern Dashboard View
          <>
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Latest Block"
                value={networkStats.latestBlock.toLocaleString()}
                icon={Blocks}
                color="blue"
                trend={{ value: 2.1, isPositive: true }}
              />
              <StatsCard
                title="Gas Price"
                value={`${parseFloat(networkStats.gasPrice).toFixed(4)} FLOW`}
                icon={Fuel}
                color="green"
                trend={{ value: 5.2, isPositive: false }}
              />
              <StatsCard
                title="Transactions/sec"
                value={networkStats.tps.toFixed(1)}
                icon={TrendingUp}
                color="purple"
                trend={{ value: 12.3, isPositive: true }}
              />
              <StatsCard
                title="Avg Block Time"
                value={`${networkStats.avgBlockTime.toFixed(1)}s`}
                icon={Clock}
                color="orange"
                trend={{ value: 1.8, isPositive: false }}
              />
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              {/* Latest Blocks - Takes 2 columns */}
              <div className="lg:col-span-2">
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <Blocks className="w-5 h-5 mr-2" />
                        Latest Flow Blocks
                      </h3>
                      <button
                        onClick={handleManualRefresh}
                        className="p-2 hover:bg-blue-400 rounded-lg transition-colors"
                        disabled={isRefreshing}
                      >
                        <RefreshCw className={`w-4 h-4 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 max-h-[500px] overflow-y-auto">
                    {isLoadingChainData && latestBlocks.length === 0 ? (
                      <div className="space-y-4">
                        {Array.from({ length: 5 }, (_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                              <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : connectionStatus === 'error' && latestBlocks.length === 0 ? (
                      <div className="text-center py-12">
                        <AlertTriangle className="w-12 h-12 mx-auto text-red-400 mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">Connection Error</h4>
                        <p className="text-gray-600 mb-4">Unable to load blocks from Flow network</p>
                        <button
                          onClick={handleManualRefresh}
                          className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Retry Connection
                        </button>
                      </div>
                    ) : latestBlocks.length === 0 ? (
                      <div className="text-center py-12">
                        <Box className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No blocks available</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {latestBlocks.map((block) => (
                          <BlockCard 
                            key={Number(block.number)} 
                            block={block} 
                            onClick={handleBlockClick}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Transactions - Takes 2 columns */}
              <div className="lg:col-span-2">
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <Hash className="w-5 h-5 mr-2" />
                        Recent Transactions
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-indigo-200 text-sm">{recentTransactions.length} found</span>
                        <button
                          onClick={handleManualRefresh}
                          className="p-2 hover:bg-indigo-400 rounded-lg transition-colors"
                          disabled={isRefreshing}
                        >
                          <RefreshCw className={`w-4 h-4 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 max-h-[500px] overflow-y-auto">
                    {isLoadingChainData && recentTransactions.length === 0 ? (
                      <div className="space-y-4">
                        {Array.from({ length: 6 }, (_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                              <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                              </div>
                              <div className="text-right">
                                <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-12"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : connectionStatus === 'error' && recentTransactions.length === 0 ? (
                      <div className="text-center py-12">
                        <AlertTriangle className="w-12 h-12 mx-auto text-red-400 mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">Connection Error</h4>
                        <p className="text-gray-600 mb-4">Unable to load transactions</p>
                        <button
                          onClick={handleManualRefresh}
                          className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Retry Connection
                        </button>
                      </div>
                    ) : recentTransactions.length === 0 ? (
                      <div className="text-center py-12">
                        <Hash className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 mb-2">No transactions found</p>
                        <p className="text-gray-400 text-sm">Try refreshing or switch networks</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {recentTransactions.map((transaction, index) => (
                          <TransactionCard 
                            key={`${transaction.hash}-${index}`}
                            transaction={transaction}
                            onClick={handleSearch}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Feed and Network Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Activity Feed - Takes 2 columns */}
              <div className="lg:col-span-2">
                <ActivityFeed activities={activities} />
              </div>

              {/* Network Information Panel */}
              <div className="space-y-6">
                {/* Network Health */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Globe className="w-5 h-5 mr-2 text-green-500" />
                    Network Health
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          connectionStatus === 'connected' ? 'bg-green-500' : 
                          connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
                          'bg-red-500'
                        }`}></div>
                        <span className="text-sm font-medium text-gray-900">
                          {connectionStatus === 'connected' ? 'Healthy' :
                           connectionStatus === 'connecting' ? 'Connecting' : 'Error'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Network</span>
                      <span className="text-sm font-medium text-gray-900">{currentChain.name}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Chain ID</span>
                      <span className="text-sm font-medium text-gray-900">{currentChain.id}</span>
                    </div>
                    
                    {lastUpdateTime && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Last Update</span>
                        <span className="text-sm font-medium text-gray-900">
                          {lastUpdateTime.toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={handleManualRefresh}
                      disabled={isRefreshing}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                      <span>Refresh Data</span>
                    </button>
                    
                    {explorerUrl && (
                      <a
                        href={explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Open FlowScan</span>
                      </a>
                    )}
                    
                    <button
                      onClick={() => setSelectedNetwork(selectedNetwork === 'mainnet' ? 'testnet' : 'mainnet')}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors"
                    >
                      <Network className="w-4 h-4" />
                      <span>Switch to {selectedNetwork === 'mainnet' ? 'Testnet' : 'Mainnet'}</span>
                    </button>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-orange-500" />
                    Performance
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Block Production</span>
                        <span className="text-sm font-medium text-gray-900">98.7%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: '98.7%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Network Load</span>
                        <span className="text-sm font-medium text-gray-900">42.3%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: '42.3%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Gas Efficiency</span>
                        <span className="text-sm font-medium text-gray-900">86.1%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full transition-all duration-500" style={{ width: '86.1%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center space-x-3 px-6 py-3 bg-white/60 backdrop-blur-md rounded-2xl border border-white/20">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700 font-medium">Live data from {currentChain.name}</span>
                {lastUpdateTime && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">Updated {lastUpdateTime.toLocaleTimeString()}</span>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mermaid Diagram Modal */}
      <DiagramModal
        isOpen={isDiagramModalOpen}
        onClose={() => setIsDiagramModalOpen(false)}
        chart={mermaidChart || ''}
      />
    </div>
  );
};

export default ModernFlowExplorer;