'use client';
import React, { useState, useEffect } from 'react';
import { Wallet, LogOut, User, Heart, Share2, Save } from 'lucide-react';
import { 
  authenticate, 
  logout, 
  getCurrentUser, 
  subscribeToAuth,
  saveAnalysisToContract,
  likeAnalysis 
} from '../../lib/flowConfig';

interface WalletConnectProps {
  analysisData?: {
    txHash: string;
    aiSummary: string;
    riskScore: number;
    insights: string[];
  };
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ analysisData }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Subscribe to authentication state
    const unsubscribe = subscribeToAuth(setUser);
    
    // Get current user on mount
    getCurrentUser().then(setUser);
    
    return unsubscribe;
  }, []);

  const handleAuthenticate = async () => {
    setIsLoading(true);
    try {
      await authenticate();
    } catch (error) {
      console.error('Authentication failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAnalysis = async (isPublic: boolean) => {
    if (!analysisData || !user?.addr) return;
    
    setIsSaving(true);
    try {
      await saveAnalysisToContract(
        analysisData.txHash,
        analysisData.aiSummary,
        analysisData.riskScore,
        analysisData.insights,
        isPublic
      );
      
      setShowSaveOptions(false);
      alert('Analysis saved to Flow blockchain!');
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save analysis. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLikeAnalysis = async () => {
    if (!analysisData?.txHash || !user?.addr) return;
    
    try {
      // For now, use the current user's address as analyst address
      // In a real app, you'd track who created each analysis
      await likeAnalysis(analysisData.txHash, user.addr);
      alert('Analysis liked!');
    } catch (error) {
      console.error('Like failed:', error);
      alert('Failed to like analysis. Please try again.');
    }
  };

  const handleShare = () => {
    if (!analysisData?.txHash) return;
    
    const shareUrl = `${window.location.origin}/analysis/${analysisData.txHash}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Analysis link copied to clipboard!');
  };

  if (!user?.loggedIn) {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={handleAuthenticate}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Wallet className="w-4 h-4" />
          )}
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Analysis Actions */}
      {analysisData && (
        <div className="flex items-center gap-2">
          <button
            onClick={handleLikeAnalysis}
            className="p-2 hover:bg-emerald-50 rounded-xl transition-colors"
            title="Like this analysis"
          >
            <Heart className="w-4 h-4 text-emerald-600" />
          </button>
          
          <button
            onClick={handleShare}
            className="p-2 hover:bg-emerald-50 rounded-xl transition-colors"
            title="Share analysis"
          >
            <Share2 className="w-4 h-4 text-emerald-600" />
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowSaveOptions(!showSaveOptions)}
              className="p-2 hover:bg-emerald-50 rounded-xl transition-colors"
              title="Save to blockchain"
            >
              <Save className="w-4 h-4 text-emerald-600" />
            </button>
            
            {showSaveOptions && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 min-w-[200px] z-50">
                <p className="text-sm font-medium text-gray-900 mb-3">Save Analysis</p>
                <div className="space-y-2">
                  <button
                    onClick={() => handleSaveAnalysis(true)}
                    disabled={isSaving}
                    className="w-full px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Public'}
                  </button>
                  <button
                    onClick={() => handleSaveAnalysis(false)}
                    disabled={isSaving}
                    className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Private'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Public analyses can be liked and shared by others
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Profile */}
      <div className="flex items-center gap-3 px-4 py-2 bg-white/90 rounded-2xl border border-emerald-100 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-100 rounded-lg">
            <User className="w-3 h-3 text-emerald-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {user.addr?.slice(0, 6)}...{user.addr?.slice(-4)}
          </span>
        </div>
        
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
          title="Disconnect wallet"
        >
          <LogOut className="w-3 h-3 text-gray-500 hover:text-red-500" />
        </button>
      </div>
    </div>
  );
};

export default WalletConnect;