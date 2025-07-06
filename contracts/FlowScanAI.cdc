import NonFungibleToken from 0x1d7e57aa55817448
import MetadataViews from 0x1d7e57aa55817448

// FlowScanAI - AI-Powered Transaction Analysis Platform
// Stores and manages AI-generated blockchain transaction analyses
access(all) contract FlowScanAI {
    
    // Events
    access(all) event AnalysisStored(txHash: String, analyst: Address, riskScore: UInt8, isPublic: Bool)
    access(all) event AnalysisLiked(txHash: String, liker: Address, newLikeCount: UInt64)
    access(all) event ProfileUpdated(user: Address, username: String, reputation: UInt64)
    access(all) event ContractInitialized()

    // Paths
    access(all) let AnalystStoragePath: StoragePath
    access(all) let AnalystPublicPath: PublicPath
    
    // Contract state
    access(all) var totalAnalyses: UInt64
    access(self) let publicAnalyses: {String: Bool} // txHash -> isPublic
    
    // Analysis data structure
    access(all) struct AnalysisData {
        access(all) let txHash: String
        access(all) let analyst: Address
        access(all) let aiSummary: String
        access(all) let riskScore: UInt8 // 0-100
        access(all) let insights: [String]
        access(all) let timestamp: UFix64
        access(all) var likes: UInt64
        access(all) let isPublic: Bool
        
        init(
            txHash: String,
            analyst: Address, 
            aiSummary: String,
            riskScore: UInt8,
            insights: [String],
            isPublic: Bool
        ) {
            pre {
                riskScore <= 100: "Risk score must be 0-100"
                aiSummary.length > 0: "Summary cannot be empty"
            }
            
            self.txHash = txHash
            self.analyst = analyst
            self.aiSummary = aiSummary
            self.riskScore = riskScore
            self.insights = insights
            self.timestamp = getCurrentBlock().timestamp
            self.likes = 0
            self.isPublic = isPublic
        }
        
        access(contract) fun addLike() {
            self.likes = self.likes + 1
        }
    }
    
    // User profile structure
    access(all) struct UserProfile {
        access(all) let address: Address
        access(all) var username: String
        access(all) var totalAnalyses: UInt64
        access(all) var reputation: UInt64
        access(all) var isVerified: Bool
        
        init(address: Address) {
            self.address = address
            self.username = ""
            self.totalAnalyses = 0
            self.reputation = 0
            self.isVerified = false
        }
        
        access(contract) fun updateUsername(username: String) {
            pre {
                username.length > 0: "Username cannot be empty"
                username.length <= 32: "Username too long"
            }
            self.username = username
        }
        
        access(contract) fun incrementAnalyses() {
            self.totalAnalyses = self.totalAnalyses + 1
        }
        
        access(contract) fun incrementReputation() {
            self.reputation = self.reputation + 1
        }
    }
    
    // Analyst resource that can store and manage analyses
    access(all) resource Analyst {
        access(self) let analyses: {String: AnalysisData} // txHash -> AnalysisData
        access(self) let likedAnalyses: {String: Bool} // txHash -> liked
        
        init() {
            self.analyses = {}
            self.likedAnalyses = {}
        }
        
        // Store a new analysis
        access(all) fun storeAnalysis(
            txHash: String,
            aiSummary: String,
            riskScore: UInt8,
            insights: [String],
            isPublic: Bool
        ) {
            let analysis = AnalysisData(
                txHash: txHash,
                analyst: self.owner!.address,
                aiSummary: aiSummary,
                riskScore: riskScore,
                insights: insights,
                isPublic: isPublic
            )
            
            self.analyses[txHash] = analysis
            
            // Update contract state
            FlowScanAI.totalAnalyses = FlowScanAI.totalAnalyses + 1
            if isPublic {
                FlowScanAI.publicAnalyses[txHash] = true
            }
            
            // Update user profile
            if let profile = FlowScanAI.profiles[self.owner!.address] {
                let updatedProfile = profile
                updatedProfile.incrementAnalyses()
                FlowScanAI.profiles[self.owner!.address] = updatedProfile
            } else {
                let newProfile = UserProfile(address: self.owner!.address)
                newProfile.incrementAnalyses()
                FlowScanAI.profiles[self.owner!.address] = newProfile
            }
            
            emit AnalysisStored(
                txHash: txHash,
                analyst: self.owner!.address,
                riskScore: riskScore,
                isPublic: isPublic
            )
        }
        
        // Like another user's analysis
        access(all) fun likeAnalysis(txHash: String, analystAddress: Address) {
            pre {
                !self.likedAnalyses.containsKey(txHash): "Already liked this analysis"
                analystAddress != self.owner!.address: "Cannot like own analysis"
            }
            
            // Find the analyst's resource and update the analysis
            if let analystCap = getAccount(analystAddress).getCapability<&{AnalystPublic}>(FlowScanAI.AnalystPublicPath).borrow() {
                if let analysis = analystCap.getAnalysis(txHash: txHash) {
                    if analysis.isPublic {
                        analystCap.incrementLikes(txHash: txHash)
                        self.likedAnalyses[txHash] = true
                        
                        // Update analyst reputation
                        if let profile = FlowScanAI.profiles[analystAddress] {
                            let updatedProfile = profile
                            updatedProfile.incrementReputation()
                            FlowScanAI.profiles[analystAddress] = updatedProfile
                        }
                        
                        emit AnalysisLiked(
                            txHash: txHash,
                            liker: self.owner!.address,
                            newLikeCount: analysis.likes + 1
                        )
                    }
                }
            }
        }
        
        // Get analysis (only if public or owned by caller)
        access(all) fun getAnalysis(txHash: String): AnalysisData? {
            return self.analyses[txHash]
        }
        
        // Get all analyses by this user
        access(all) fun getAllAnalyses(): [AnalysisData] {
            return self.analyses.values
        }
        
        // Check if user has liked an analysis
        access(all) fun hasLiked(txHash: String): Bool {
            return self.likedAnalyses.containsKey(txHash)
        }
        
        // Increment likes for an analysis (called by other users)
        access(contract) fun incrementLikes(txHash: String) {
            if let analysis = &self.analyses[txHash] as &AnalysisData? {
                analysis.addLike()
            }
        }
    }
    
    // Public interface for Analyst resource
    access(all) resource interface AnalystPublic {
        access(all) fun getAnalysis(txHash: String): AnalysisData?
        access(all) fun getAllAnalyses(): [AnalysisData]
        access(all) fun hasLiked(txHash: String): Bool
        access(contract) fun incrementLikes(txHash: String)
    }
    
    // Global user profiles
    access(self) let profiles: {Address: UserProfile}
    
    // Create a new Analyst resource
    access(all) fun createAnalyst(): @Analyst {
        return <- create Analyst()
    }
    
    // Update user profile
    access(all) fun updateProfile(username: String) {
        let address = self.account.address
        
        if let profile = self.profiles[address] {
            let updatedProfile = profile
            updatedProfile.updateUsername(username: username)
            self.profiles[address] = updatedProfile
        } else {
            let newProfile = UserProfile(address: address)
            newProfile.updateUsername(username: username)
            self.profiles[address] = newProfile
        }
        
        emit ProfileUpdated(
            user: address,
            username: username,
            reputation: self.profiles[address]?.reputation ?? 0
        )
    }
    
    // Get user profile
    access(all) fun getUserProfile(address: Address): UserProfile? {
        return self.profiles[address]
    }
    
    // Get public analysis by txHash (from any user)
    access(all) fun getPublicAnalysis(txHash: String, analystAddress: Address): AnalysisData? {
        if let analystCap = getAccount(analystAddress).getCapability<&{AnalystPublic}>(self.AnalystPublicPath).borrow() {
            if let analysis = analystCap.getAnalysis(txHash: txHash) {
                if analysis.isPublic {
                    return analysis
                }
            }
        }
        return nil
    }
    
    // Get all public analyses (for discovery feed)
    access(all) fun getPublicAnalyses(): [String] {
        return self.publicAnalyses.keys
    }
    
    // Get contract statistics
    access(all) fun getStats(): {String: UInt64} {
        return {
            "totalAnalyses": self.totalAnalyses,
            "totalPublicAnalyses": UInt64(self.publicAnalyses.length),
            "totalUsers": UInt64(self.profiles.length)
        }
    }
    
    init() {
        // Set storage paths
        self.AnalystStoragePath = /storage/FlowScanAIAnalyst
        self.AnalystPublicPath = /public/FlowScanAIAnalyst
        
        // Initialize contract state
        self.totalAnalyses = 0
        self.publicAnalyses = {}
        self.profiles = {}
        
        emit ContractInitialized()
    }
}