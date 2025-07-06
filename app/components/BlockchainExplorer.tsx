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
  Target,
  BarChart3,
  ChevronDown,
  Globe,
  FlaskConical
} from 'lucide-react';
import { formatAssistantMessage } from '../utils/messageFormatter';
import { formatAddress } from '../utils/formatUtils';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const MermaidDiagram = dynamic(() => import('./MermaidDiagram'), {
  ssr: false,
  loading: () => (
    <div className="border rounded-lg bg-white p-4 min-h-[200px] flex items-center justify-center">
      <div className="text-gray-500">Loading diagram...</div>
    </div>
  )
});

const DiagramModal = dynamic(() => import('./DiagramModal'), {
  ssr: false
});
import InteractiveMetrics from './InteractiveMetrics';
import RealTimeMetrics from './RealTimeMetrics';
import AnalysisDashboard from './AnalysisDashboard';
import RiskPredictor from './RiskPredictor';
import TransactionTimeline from './TransactionTimeline';
import WalletConnect from './WalletConnect';

// Configure Flow EVM Mainnet
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

// Configure Flow EVM Testnet
const flowTestnet = defineChain({
  id: 545,
  name: 'Flow EVM Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Flow',
    symbol: 'FLOW',
  },
  rpcUrls: {
    default: { http: ['https://testnet.evm.nodes.onflow.org'] },
    public: { http: ['https://testnet.evm.nodes.onflow.org'] },
  },
  blockExplorers: {
    default: { name: 'FlowScan Testnet', url: 'https://evm-testnet.flowscan.io' },
  },
});

const BlockchainExplorer: React.FC = () => {
  const [selectedNetwork, setSelectedNetwork] = useState<'mainnet' | 'testnet'>('mainnet');
  const [latestBlocks, setLatestBlocks] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [networkStats, setNetworkStats] = useState({
    latestBlock: 0,
    gasPrice: '0',
    totalTransactions: 0,
    avgBlockTime: 0,
  });
  const [isLoadingChainData, setIsLoadingChainData] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [selectedTxHash, setSelectedTxHash] = useState<string | null>(null);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);
  const [mermaidChart, setMermaidChart] = useState<string | null>(null);
  const [isDiagramModalOpen, setIsDiagramModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState('Initializing...');
  const [isClient, setIsClient] = useState(false);
  const [advancedAnalysisData, setAdvancedAnalysisData] = useState<any>(null);
  const [showInteractiveMetrics, setShowInteractiveMetrics] = useState(false);
  const [showAnalysisDashboard, setShowAnalysisDashboard] = useState(false);
  const [activeTab, setActiveTab] = useState<'analyze' | 'predict' | 'timeline'>('analyze');
  const [timelineAddress, setTimelineAddress] = useState<string>('');
  const [shouldAnalyzeTimeline, setShouldAnalyzeTimeline] = useState(false);
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const networkDropdownRef = useRef<HTMLDivElement>(null);

  // Fix hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (networkDropdownRef.current && !networkDropdownRef.current.contains(event.target as Node)) {
        setIsNetworkDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Enhanced analysis data fetching
  const fetchEnhancedAnalysisData = async (txHash: string) => {
    try {
      console.log('🔬 Fetching enhanced analysis data...');
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Analyze transaction ${txHash} on Flow EVM chain ${getCurrentChain().id} and return detailed analysis data for visualization.`
            }
          ],
          txHash: txHash,
          chainId: getCurrentChain().id,
          enhancedAnalysis: true
        }),
      });

      if (response.ok) {
        const reader = response.body?.getReader();
        if (reader) {
          let fullResponse = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = new TextDecoder().decode(value);
            fullResponse += chunk;
            
            // Look for the analysis data in the stream
            const dataMatch = fullResponse.match(/data:\s*({[\s\S]*})/);
            if (dataMatch) {
              try {
                const analysisData = JSON.parse(dataMatch[1]);
                if (analysisData.success && analysisData.data) {
                  const parsedData = JSON.parse(analysisData.data);
                  if (parsedData.advancedAnalysis) {
                    setAdvancedAnalysisData(parsedData.advancedAnalysis);
                    setShowInteractiveMetrics(true);
                    console.log('✅ Enhanced analysis data loaded');
                    break;
                  }
                }
              } catch (e) {
                // Continue parsing
              }
            }
          }
        }
      }
    } catch (error) {
      console.warn('Enhanced analysis fetch failed:', error);
      // Generate demo data for demonstration
      generateDemoAnalysisData();
    }
  };

  // Generate demo analysis data for demonstration
  const generateDemoAnalysisData = () => {
    const demoData = {
      networkMetrics: {
        congestionLevel: 'Medium',
        averageBlockTime: 12.5,
        blockContext: {
          position: 'Recent in context',
          confirmations: 15,
          timeFromLatest: 180
        }
      },
      networkIntelligence: {
        gasPrediction: {
          nextHourPrediction: 'Stable',
          next24HourTrend: 'Slightly Decreasing',
          optimalGasPrice: '25.8',
          confidence: 78,
          savings: {
            immediate: '0%',
            waitFor1Hour: '3.2%',
            waitFor6Hours: '8.5%'
          }
        },
        networkHealth: {
          score: 87,
          factors: ['Excellent block time consistency', 'Healthy network utilization', 'Stable gas prices'],
          warnings: ['Moderate congestion during peak hours']
        },
        trends: {
          networkActivity: 'High',
          gasUsageTrend: 'Stable',
          blockUtilization: '68.5%',
          transactionVolume: 'Normal',
          dexActivity: 'Normal'
        }
      },
      mevIndicators: [
        {
          type: 'MEV_SUSPICIOUS_GAS',
          severity: 'Medium',
          description: 'Gas price slightly above network average',
          confidence: 65
        }
      ],
      gasAnalysis: {
        efficiency: 'Good',
        recommendations: [
          'Gas price is optimal for current network conditions',
          'Consider using EIP-1559 for better fee estimation'
        ]
      },
      flowSpecificFeatures: {
        crossChain: {
          detected: false,
          bridges: [],
          crossChainVolume: '0',
          targetChains: []
        },
        cadenceIntegration: {
          featuresUsed: 2,
          resourcesDetected: ['Flow Service Account Interaction'],
          capabilitiesUsed: ['public', 'access'],
          accessControlPatterns: []
        },
        flowEcosystem: {
          dappCategory: 'Token Transfer',
          popularProtocols: ['FlowToken'],
          ecosystemHealth: 'Good'
        }
      },
      patterns: {
        transactionType: 'Simple Transfer',
        clustering: {
          cluster: 'Simple User',
          confidence: 90
        }
      }
    };

    setTimeout(() => {
      setAdvancedAnalysisData(demoData);
      setShowInteractiveMetrics(true);
      console.log('📊 Demo analysis data loaded');
    }, 2000);
  };

  // Create Viem Public Client based on selected network
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
      console.log('AI Analysis completed:', message.content.slice(0, 200) + '...');
      
      const mermaidMatch = message.content.match(/```mermaid\n([\s\S]*?)\n```/);
      
      if (mermaidMatch) {
        const diagram = mermaidMatch[1].trim();
        setMermaidChart(diagram);
        setCurrentMessage(message.content.replace(/```mermaid\n[\s\S]*?\n```/, '').trim());
      } else {
        setCurrentMessage(message.content);
        setMermaidChart(null);
      }

      // Show the modern analysis dashboard
      // setShowAnalysisDashboard(true);

      // Fetch enhanced analysis data after successful completion
      if (selectedTxHash) {
        fetchEnhancedAnalysisData(selectedTxHash);
      }
    },
    onError: (error) => {
      console.error('Chat error:', error);
    }
  });

  // Simulate realistic analysis progress
  useEffect(() => {
    if (isLoading) {
      setAnalysisProgress(0);
      setAnalysisStage('Fetching transaction data...');
      
      const stages = [
        { stage: 'Fetching transaction data...', duration: 1000, progress: 15 },
        { stage: 'Analyzing contract interactions...', duration: 1500, progress: 35 },
        { stage: 'Processing security patterns...', duration: 2000, progress: 60 },
        { stage: 'Running MEV detection...', duration: 1500, progress: 80 },
        { stage: 'Finalizing analysis...', duration: 1000, progress: 95 }
      ];
      
      let currentStageIndex = 0;
      let currentProgress = 0;
      
      const progressInterval = setInterval(() => {
        if (currentStageIndex < stages.length) {
          const stage = stages[currentStageIndex];
          currentProgress += 1;
          
          if (currentProgress >= stage.progress) {
            setAnalysisStage(stage.stage);
            setAnalysisProgress(stage.progress);
            currentStageIndex++;
          } else {
            setAnalysisProgress(currentProgress);
          }
        } else {
          clearInterval(progressInterval);
        }
      }, 100);
      
      return () => clearInterval(progressInterval);
    } else {
      setAnalysisProgress(0);
      setAnalysisStage('Initializing...');
    }
  }, [isLoading]);

  // Enhanced data fetching with better error handling and retry logic
  const fetchBlockchainData = async (isRetry = false) => {
    try {
      if (!isRetry) {
        setIsLoadingChainData(true);
        setIsRefreshing(true);
      }
      setConnectionStatus('connecting');
      
      const client = getCurrentClient();
      
      console.log(`🔍 Fetching data from ${getCurrentChain().name}... (Attempt ${retryCount + 1})`);
      
      // Get latest block number with timeout
      const blockNumberPromise = client.getBlockNumber();
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout getting block number')), 10000)
      );
      
      const blockNumber: bigint = await Promise.race([blockNumberPromise, timeoutPromise]);
      setConnectionStatus('connected');
      console.log(`✅ Connected to ${getCurrentChain().name}, latest block: ${blockNumber}`);
      
      // Fetch more blocks (15 blocks for better data)
      const blocksToFetch = 15;
      const blockPromises = Array.from({ length: blocksToFetch }, async (_, i) => {
        try {
          const targetBlock = blockNumber - BigInt(i);
          const blockPromise = client.getBlock({
            blockNumber: targetBlock,
            includeTransactions: true,
          });
          
          // Add timeout for each block
          const timeout = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error(`Timeout fetching block ${targetBlock}`)), 8000)
          );
          
          const block = await Promise.race([blockPromise, timeout]);
          return block;
        } catch (error: any) {
          console.warn(`Failed to fetch block ${blockNumber - BigInt(i)}:`, error?.message);
          return null;
        }
      });
      
      // Wait for all blocks with a global timeout
      const blockResults = await Promise.allSettled(blockPromises);
      const blocks = blockResults
        .filter((result): result is PromiseFulfilledResult<any> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value)
        .filter(block => block && block.number); // Ensure blocks are valid
      
      if (blocks.length === 0) {
        throw new Error('No blocks could be fetched');
      }
      
      setLatestBlocks(blocks);
      console.log(`📦 Loaded ${blocks.length} blocks`);
      
      // Get network stats
      let gasPrice = BigInt(0);
      try {
        gasPrice = await client.getGasPrice();
        console.log('Gas price fetched:', gasPrice.toString());
      } catch (error) {
        console.warn('Could not fetch gas price:', error);
        // Use a reasonable default for Flow EVM (around 100 GWEI = 0.0000001 FLOW)
        gasPrice = BigInt('100000000000'); // 100 GWEI in wei
      }
      
      // Calculate average block time
      let avgBlockTime = 0;
      if (blocks.length >= 2) {
        const timeDiffs = [];
        for (let i = 0; i < Math.min(blocks.length - 1, 5); i++) {
          const timeDiff = Number(blocks[i].timestamp) - Number(blocks[i + 1].timestamp);
          if (timeDiff > 0) timeDiffs.push(timeDiff);
        }
        avgBlockTime = timeDiffs.length > 0 ? 
          timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length : 0;
      }
      
      // Collect ALL transactions from all blocks
      const allTransactions = blocks.reduce((acc: any[], block: any) => {
        if (block?.transactions && Array.isArray(block.transactions)) {
          // Filter out any invalid transactions
          const validTxs = block.transactions.filter((tx: any) => 
            tx && 
            tx.hash && 
            tx.from && 
            typeof tx.hash === 'string' && 
            tx.hash.length === 66 // Valid hash length
          );
          return [...acc, ...validTxs];
        }
        return acc;
      }, []);

      // Sort transactions by block number (descending) and transaction index
      const sortedTransactions = allTransactions
        .sort((a: any, b: any) => {
          // First sort by block number (descending)
          const blockDiff = Number(b.blockNumber || 0) - Number(a.blockNumber || 0);
          if (blockDiff !== 0) return blockDiff;
          // Then by transaction index within the same block
          return Number(b.transactionIndex || 0) - Number(a.transactionIndex || 0);
        })
        .slice(0, 20); // Take top 20 transactions
      
      setRecentTransactions(sortedTransactions);
      
      // Calculate total transaction count
      const totalTxCount = allTransactions.length;
      
      setNetworkStats({
        latestBlock: Number(blockNumber),
        gasPrice: formatEther(gasPrice),
        totalTransactions: totalTxCount,
        avgBlockTime: avgBlockTime,
      });
      
      setLastUpdateTime(new Date());
      setRetryCount(0); // Reset retry count on success
      
      console.log(`📊 Loaded ${blocks.length} blocks, ${sortedTransactions.length} transactions (${totalTxCount} total)`);

    } catch (error: any) {
      console.error('❌ Error fetching Flow blockchain data:', error);
      setConnectionStatus('error');
      
      // Implement retry logic
      if (retryCount < 3) {
        console.log(`🔄 Retrying in 3 seconds... (${retryCount + 1}/3)`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchBlockchainData(true), 3000);
      } else {
        console.error('Max retries reached. Please check your connection.');
      }
    } finally {
      setIsLoadingChainData(false);
      setIsRefreshing(false);
    }
  };

  // Set up polling for updates with smart refresh
  useEffect(() => {
    // Reset retry count when switching networks
    setRetryCount(0);
    setLatestBlocks([]);
    setRecentTransactions([]);
    
    // Initial fetch
    fetchBlockchainData();

    // Set up polling interval (every 15 seconds for Flow)
    const interval = setInterval(() => {
      if (!isSearchMode && connectionStatus === 'connected') {
        fetchBlockchainData();
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [selectedNetwork]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Validate transaction hash format
    if (!input.match(/^0x[a-fA-F0-9]{64}$/)) {
      alert('Please enter a valid transaction hash (64 characters starting with 0x)');
      return;
    }
    
    console.log(`🔍 Starting analysis for transaction: ${input}`);
    setIsSearchMode(true);
    setSelectedTxHash(input);
    setCurrentMessage(null);
    setMermaidChart(null);
    setAdvancedAnalysisData(null);
    setShowInteractiveMetrics(false);
    setShowAnalysisDashboard(false);
    chatHandleSubmit(e);
  };

  const formRef = useRef<HTMLFormElement>(null);

  const handleSearch = (hash: string) => {
    console.log('🔎 handleSearch called with hash:', hash);
    
    setInput(hash);
    setIsSearchMode(true);
    setSelectedTxHash(hash);
    setCurrentMessage(null);
    setMermaidChart(null);
    setAdvancedAnalysisData(null);
    setShowInteractiveMetrics(false);
    setShowAnalysisDashboard(false);

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
    setAdvancedAnalysisData(null);
    setShowInteractiveMetrics(false);
    setShowAnalysisDashboard(false);
    setInput('');
  };

  const formatValue = (value: bigint | undefined): string => {
    if (typeof value === 'undefined') return '0';
    return formatEther(value);
  };

  const handleReload = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    reload();
  };

  const handleBlockClick = (block: any) => {
    console.log('Block clicked:', block.number);
    if (block.transactions && block.transactions.length > 0) {
      // Find the most interesting transaction (with value or data)
      const interestingTx = block.transactions.find((tx: any) => 
        (tx.value && tx.value > BigInt(0)) || (tx.data && tx.data !== '0x' && tx.data.length > 10)
      ) || block.transactions[0];
      
      if (interestingTx) {
        console.log('Analyzing transaction:', interestingTx.hash);
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Beautiful Modern Navbar */}
      <nav className="bg-gradient-to-r from-emerald-50/95 via-teal-50/95 to-cyan-50/95 backdrop-blur-xl border-b border-emerald-200/30 sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div 
              className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity duration-200"
              onClick={() => window.location.href = '/'}
            >
              <div className="relative">
                <Image 
                  src="/logoL.png" 
                  alt="Lumina Logo" 
                  width={48}
                  height={48}
                  className="object-contain drop-shadow-lg"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-emerald-600">Lumina</h1>
                <p className="text-sm text-gray-600">AI-Powered Blockchain Intelligence</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl text-sm font-semibold shadow-lg ${
                connectionStatus === 'connected' ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 text-white' :
                connectionStatus === 'connecting' ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white' :
                'bg-gradient-to-r from-red-400 to-red-600 text-white'
              }`}>
                <div className={`w-3 h-3 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-white shadow-lg' :
                  connectionStatus === 'connecting' ? 'bg-white animate-pulse shadow-lg' :
                  'bg-white shadow-lg'
                }`} />
                {connectionStatus === 'connected' ? 'Live' :
                 connectionStatus === 'connecting' ? 'Connecting' : 'Offline'}
              </div>
              
              {/* Network Selector */}
              <div ref={networkDropdownRef} className="relative">
                <button
                  onClick={() => setIsNetworkDropdownOpen(!isNetworkDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-2xl text-sm font-semibold border-0 focus:ring-4 focus:ring-blue-500/30 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  {selectedNetwork === 'mainnet' ? (
                    <>
                      <Globe className="w-4 h-4 text-blue-600" />
                      <span>Mainnet</span>
                    </>
                  ) : (
                    <>
                      <FlaskConical className="w-4 h-4 text-green-600" />
                      <span>Testnet</span>
                    </>
                  )}
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isNetworkDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isNetworkDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white/95 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl z-50 overflow-hidden">
                    <button
                      onClick={() => {
                        setSelectedNetwork('mainnet');
                        setIsNetworkDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-200 ${
                        selectedNetwork === 'mainnet' ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      <Globe className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="font-semibold">Mainnet</div>
                        <div className="text-xs text-gray-500">Production network</div>
                      </div>
                      {selectedNetwork === 'mainnet' && (
                        <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedNetwork('testnet');
                        setIsNetworkDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 transition-all duration-200 ${
                        selectedNetwork === 'testnet' ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700' : 'text-gray-700'
                      }`}
                    >
                      <FlaskConical className="w-4 h-4 text-green-600" />
                      <div>
                        <div className="font-semibold">Testnet</div>
                        <div className="text-xs text-gray-500">Testing network</div>
                      </div>
                      {selectedNetwork === 'testnet' && (
                        <div className="ml-auto w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </button>
                  </div>
                )}
              </div>
              
              <div className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl text-sm font-semibold text-gray-700 shadow-lg">
                Chain {currentChain.id}
              </div>
              
              {explorerUrl && (
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 text-gray-600 hover:text-purple-600 transition-all duration-300 bg-white/90 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105"
                  title="Open FlowScan"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              )}
              
              {/* Flow Wallet Connection */}
              <WalletConnect />
              
              {!isSearchMode && (
                <button 
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="p-3 text-gray-600 hover:text-blue-600 transition-all duration-300 disabled:opacity-50 bg-white/90 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105"
                  title="Refresh data"
                >
                  <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Beautiful Search Section - Only show for Analyze Transaction tab */}
      {activeTab === 'analyze' && (
        <div className="bg-white/50 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-emerald-600 mb-2">
              AI-Powered Flow Analysis
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">Enter any Flow transaction hash for deep insights and analysis</p>
          </div>
          
          <form ref={formRef} onSubmit={handleFormSubmit} className="relative max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl blur-lg opacity-20"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-1.5">
                <div className="flex items-center gap-3">
                  <div className="pl-3">
                    <Search className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Enter transaction hash (0x...) to analyze with AI"
                    disabled={isLoading}
                    className="flex-1 py-3 bg-transparent border-0 focus:outline-none text-base placeholder-gray-400"
                  />
                  <div className="flex items-center gap-2 pr-1">
                    {isSearchMode && (
                      <button
                        type="button"
                        onClick={handleBackToExplorer}
                        className="px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors rounded-xl hover:bg-gray-100 text-sm font-medium"
                      >
                        ← Back
                      </button>
                    )}
                    <button 
                      type="submit" 
                      disabled={isLoading || !input.trim()}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          <span>Analyze</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
          
          {error && (
            <div className="mt-6 p-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-3xl shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-100 rounded-2xl">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <div className="text-red-700 font-semibold text-lg">Analysis failed</div>
                    <div className="text-red-600">Please check the transaction hash and try again</div>
                  </div>
                </div>
                <button 
                  onClick={handleReload}
                  className="px-6 py-3 bg-white text-red-600 rounded-2xl hover:bg-red-50 flex items-center gap-3 border border-red-200 transition-all duration-300 hover:shadow-lg font-semibold"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Retry</span>
                </button>
              </div>
            </div>
          )}
        </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden">
            <div className="flex items-stretch">
              <button
                onClick={() => setActiveTab('analyze')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 transition-all duration-200 font-medium text-sm ${
                  activeTab === 'analyze'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-transparent text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">Analyze Transaction</span>
                <span className="sm:hidden">Analyze</span>
              </button>
              <button
                onClick={() => setActiveTab('predict')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 transition-all duration-200 font-medium text-sm border-l border-gray-200/50 ${
                  activeTab === 'predict'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-transparent text-gray-700 hover:bg-emerald-50'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Risk Prediction</span>
                <span className="sm:hidden">Risk</span>
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 transition-all duration-200 font-medium text-sm border-l border-gray-200/50 ${
                  activeTab === 'timeline'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-transparent text-gray-700 hover:bg-teal-50'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">Transaction Timeline</span>
                <span className="sm:hidden">Timeline</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'predict' ? (
          <RiskPredictor
            onAnalysisComplete={(analysis) => {
              console.log('Risk analysis completed:', analysis);
            }}
          />
        ) : activeTab === 'timeline' ? (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="text-center">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="p-3 bg-cyan-600 rounded-xl shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                  Transaction Timeline
                </h2>
              </div>
              <p className="text-gray-600 mb-6">
                Analyze the complete transaction history and patterns for any Flow EVM address
              </p>
            </div>

            {/* Address Input */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 p-6 shadow-lg">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Flow EVM Address
                  </label>
                  <input
                    type="text"
                    value={timelineAddress}
                    onChange={(e) => {
                      setTimelineAddress(e.target.value);
                      setShouldAnalyzeTimeline(false); // Reset analysis state when address changes
                    }}
                    placeholder="0x... or paste any Flow EVM address"
                    className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all font-mono text-sm"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      if (timelineAddress) {
                        setShouldAnalyzeTimeline(true);
                      }
                    }}
                    disabled={!timelineAddress}
                    className="px-6 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold flex items-center gap-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Analyze</span>
                  </button>
                </div>
              </div>
            </div>
            
            {timelineAddress && shouldAnalyzeTimeline ? (
              <TransactionTimeline
                address={timelineAddress}
                shouldAnalyze={shouldAnalyzeTimeline}
                onEventSelect={(event) => {
                  console.log('Timeline event selected:', event);
                  // Could switch to analyze tab and auto-populate with this transaction
                }}
              />
            ) : timelineAddress && !shouldAnalyzeTimeline ? (
              // Show "ready to analyze" state when address is entered but not yet analyzed
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 p-8 shadow-lg text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-cyan-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Ready to Analyze
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Address entered: <span className="font-mono text-sm">{formatAddress(timelineAddress)}</span>
                  </p>
                  <p className="text-gray-500 text-sm">
                    Click the &quot;Analyze&quot; button above to start the timeline analysis.
                  </p>
                </div>
              </div>
            ) : (
              // Empty State
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 p-12 shadow-lg text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Clock className="w-10 h-10 text-cyan-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Ready to Analyze Transaction History
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Enter any Flow EVM address above to see a comprehensive timeline of all transactions, 
                    pattern analysis, and risk assessment.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-cyan-600">
                      <Activity className="w-4 h-4" />
                      <span>Transaction History</span>
                    </div>
                    <div className="flex items-center gap-2 text-teal-600">
                      <Target className="w-4 h-4" />
                      <span>Pattern Analysis</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-600">
                      <Shield className="w-4 h-4" />
                      <span>Risk Assessment</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : showAnalysisDashboard && selectedTxHash ? (
          // Modern Analysis Dashboard
          <AnalysisDashboard
            txHash={selectedTxHash}
            analysisData={currentMessage}
            mermaidChart={mermaidChart}
            onBack={handleBackToExplorer}
          />
        ) : isSearchMode ? (
          // Analysis Section
          <div id="analysis-section" className="space-y-6">
            <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 opacity-50"></div>
              
              <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-600 rounded-xl shadow-md">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-emerald-600">
                      {selectedTxHash ? 'AI Analysis Results' : 'AI Analysis'}
                    </h2>
                    <p className="text-gray-600 text-sm">
                      {selectedTxHash ? `Transaction: ${formatAddress(selectedTxHash)}` : 'Detailed blockchain analysis'}
                    </p>
                  </div>
                </div>
                {selectedTxHash && explorerUrl && (
                  <a
                    href={`${explorerUrl}/tx/${selectedTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View on FlowScan</span>
                  </a>
                )}
              </div>
            </div>
              
            
            {/* Content Section - Only show when there's content */}
            {(mermaidChart || currentMessage) && (
              <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50">
                <div className="absolute inset-0 bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/30 pointer-events-none"></div>
                
                <div className="relative p-8 space-y-8">
                  {mermaidChart && (
                    <div className="bg-gradient-to-br from-gray-50 to-emerald-50/50 rounded-2xl p-6 border border-gray-200/50">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-600 rounded-xl">
                            <Activity className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">Transaction Flow Diagram</h3>
                        </div>
                        <button
                          onClick={() => setIsDiagramModalOpen(true)}
                          className="p-2 hover:bg-white/60 rounded-xl transition-all duration-300 hover:shadow-lg"
                          title="View full screen"
                        >
                          <Maximize2 className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/50">
                        <MermaidDiagram chart={mermaidChart} />
                      </div>
                    </div>
                  )}
                  
                  {currentMessage && (
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
                      <div className="prose max-w-none prose-headings:text-gray-900 prose-p:text-gray-700">
                        <div dangerouslySetInnerHTML={{ 
                          __html: formatAssistantMessage(currentMessage)
                        }} />
                      </div>
                      
                      {/* Save Analysis to Flow Blockchain */}
                      <div className="mt-6 pt-4 border-t border-gray-200/50">
                        <WalletConnect analysisData={{
                          txHash: input,
                          aiSummary: currentMessage,
                          riskScore: 50, // Default risk score, could be extracted from analysis
                          insights: [currentMessage] // Simplified insights
                        }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Interactive Metrics Dashboard */}
            {advancedAnalysisData && (
              <InteractiveMetrics 
                data={advancedAnalysisData} 
                isVisible={showInteractiveMetrics}
              />
            )}
            
            {/* Loading Section */}
            {isLoading && (
              <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 opacity-60"></div>
                
                <div className="relative p-8">
                  <div className="flex items-start gap-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-emerald-600 rounded-2xl blur-md opacity-70"></div>
                      <div className="relative p-3 bg-emerald-600 rounded-2xl">
                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-xl font-bold text-emerald-600 mb-2">
                        Analyzing Flow transaction...
                      </div>
                      <div className="text-gray-600 mb-6">Running advanced AI analysis with MEV detection and security assessment</div>
                      
                      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
                        <div className="flex items-center gap-3 text-gray-700 mb-4">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                          <span className="font-medium">{analysisStage}</span>
                        </div>
                        <div className="mb-4 bg-gray-200/80 rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 h-3 rounded-full transition-all duration-300 ease-out relative"
                            style={{width: `${analysisProgress}%`}}
                          >
                            <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 font-medium">{analysisProgress}% complete</span>
                          <span className="text-sm text-emerald-600 font-semibold">AI Processing...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Explorer View
          <>
            {/* Real-Time Metrics Dashboard */}
            <RealTimeMetrics 
              networkData={networkStats} 
              isConnected={connectionStatus === 'connected'} 
            />

            {/* Additional Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl border border-emerald-100/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/20 to-transparent"></div>
                <div className="relative flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-600">Network Status</div>
                    <div className="text-lg font-semibold text-gray-900">{getCurrentChain().name}</div>
                  </div>
                  <div className={`w-3 h-3 rounded-full shadow-lg ${
                    connectionStatus === 'connected' ? 'bg-emerald-500' : 'bg-red-500'
                  }`}></div>
                </div>
              </div>
              
              <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl border border-teal-100/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-50/20 to-transparent"></div>
                <div className="relative">
                  <div className="text-sm font-medium text-gray-600">Last Update</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {lastUpdateTime ? lastUpdateTime.toLocaleTimeString() : 'Never'}
                  </div>
                </div>
              </div>
              
              <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl border border-cyan-100/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/20 to-transparent"></div>
                <div className="relative">
                  <div className="text-sm font-medium text-gray-600">Chain ID</div>
                  <div className="text-lg font-semibold text-gray-900">{currentChain.id}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Latest Blocks */}
              <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl border border-emerald-100/50 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/20 to-transparent pointer-events-none"></div>
                <div className="relative px-6 py-5 border-b border-emerald-100/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-600 rounded-xl shadow-lg">
                        <Blocks className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Latest Blocks</h2>
                        <p className="text-sm text-gray-600">Click to explore transactions</p>
                      </div>
                    </div>
                    <button
                      onClick={handleManualRefresh}
                      className={`p-3 rounded-xl transition-all duration-300 shadow-lg ${
                        isRefreshing 
                          ? 'bg-gray-200 cursor-not-allowed' 
                          : 'bg-white hover:bg-emerald-50 hover:shadow-xl hover:scale-105'
                      }`}
                      disabled={isRefreshing}
                      title="Refresh blocks"
                    >
                      <RefreshCw className={`w-5 h-5 text-emerald-600 ${
                        isRefreshing ? 'animate-spin' : ''
                      }`} />
                    </button>
                  </div>
                </div>
                <div className="relative divide-y divide-emerald-100/50 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-transparent">
                  {isLoadingChainData && latestBlocks.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Loading blocks...</p>
                    </div>
                  ) : connectionStatus === 'error' && latestBlocks.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                      <AlertTriangle className="w-6 h-6 mx-auto text-red-400 mb-2" />
                      <p className="text-sm text-red-600 mb-2">Unable to load blocks</p>
                      <button
                        onClick={handleManualRefresh}
                        className="px-3 py-1 bg-red-50 text-red-600 rounded text-sm hover:bg-red-100 transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  ) : latestBlocks.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                      <Box className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">No blocks available</p>
                    </div>
                  ) : (
                    latestBlocks.map((block, index) => (
                      <div 
                        key={Number(block.number)} 
                        className="relative px-4 py-3 hover:bg-emerald-50/50 cursor-pointer transition-all duration-200 hover:shadow-sm active:bg-emerald-100/30 select-none"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleBlockClick(block);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleBlockClick(block);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
                              <Blocks className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">#{Number(block.number)}</div>
                              <div className="text-sm text-gray-600">
                                {block.transactions.length} txns · {((Number(block.gasUsed || 0) / Number(block.gasLimit || 1)) * 100).toFixed(1)}% gas
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-emerald-500" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl border border-teal-100/50 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-50/20 to-transparent pointer-events-none"></div>
                <div className="relative px-6 py-5 border-b border-teal-100/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-teal-600 rounded-xl shadow-lg">
                        <Hash className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
                        <p className="text-sm text-gray-600">Click to analyze with AI</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="px-4 py-2 bg-teal-100 rounded-xl border border-teal-200/50">
                        <span className="text-sm font-bold text-teal-700">{recentTransactions.length} found</span>
                      </div>
                      <button
                        onClick={handleManualRefresh}
                        className={`p-3 rounded-xl transition-all duration-300 shadow-lg ${
                          isRefreshing 
                            ? 'bg-gray-200 cursor-not-allowed' 
                            : 'bg-white hover:bg-teal-50 hover:shadow-xl hover:scale-105'
                        }`}
                        disabled={isRefreshing}
                        title="Refresh transactions"
                      >
                        <RefreshCw className={`w-5 h-5 text-teal-600 ${
                          isRefreshing ? 'animate-spin' : ''
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="relative divide-y divide-emerald-100/50 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-transparent">
                  {isLoadingChainData && recentTransactions.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Loading transactions...</p>
                    </div>
                  ) : connectionStatus === 'error' && recentTransactions.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                      <AlertTriangle className="w-6 h-6 mx-auto text-red-400 mb-2" />
                      <p className="text-sm text-red-600 mb-2">Unable to load transactions</p>
                      <button
                        onClick={handleManualRefresh}
                        className="px-3 py-1 bg-red-50 text-red-600 rounded text-sm hover:bg-red-100 transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  ) : recentTransactions.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                      <Hash className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">No transactions found</p>
                    </div>
                  ) : (
                    recentTransactions.map((transaction, index) => {
                      const flowValue = parseFloat(formatValue(transaction.value));
                      const hasValue = flowValue > 0;
                      const hasData = transaction.data && transaction.data !== '0x' && transaction.data.length > 10;
                      
                      return (
                        <div 
                          key={`${transaction.hash}-${index}`}
                          className="relative px-4 py-3 hover:bg-emerald-50/50 cursor-pointer transition-all duration-200 hover:shadow-sm active:bg-emerald-100/30 select-none"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Transaction clicked:', transaction.hash);
                            handleSearch(transaction.hash);
                          }}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleSearch(transaction.hash);
                            }
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                hasValue ? 'bg-emerald-100' : hasData ? 'bg-teal-100' : 'bg-cyan-100'
                              }`}>
                                <Hash className={`w-4 h-4 ${
                                  hasValue ? 'text-emerald-600' : hasData ? 'text-teal-600' : 'text-cyan-600'
                                }`} />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{formatAddress(transaction.hash)}</div>
                                <div className="text-sm text-gray-600">
                                  {formatAddress(transaction.from)} → {formatAddress(transaction.to || 'Contract')}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">
                                {flowValue.toFixed(4)} FLOW
                              </div>
                              <div className="text-sm text-gray-600">
                                Block #{Number(transaction.blockNumber || 0)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Footer Info */}
            {!isLoadingChainData && connectionStatus === 'connected' && (
              <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-4 px-6 py-3 bg-white rounded-lg border border-gray-200 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Live from {getCurrentChain().name}</span>
                  </div>
                  {lastUpdateTime && (
                    <span>Updated {lastUpdateTime.toLocaleTimeString()}</span>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add the modal component */}
      <DiagramModal
        isOpen={isDiagramModalOpen}
        onClose={() => setIsDiagramModalOpen(false)}
        chart={mermaidChart || ''}
      />
    </div>
  );
};

export default BlockchainExplorer;