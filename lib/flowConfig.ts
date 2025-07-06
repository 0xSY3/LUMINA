import * as fcl from "@onflow/fcl";

// Configure FCL for Flow Testnet (switch to mainnet for production)
fcl.config({
  "accessNode.api": "https://rest-testnet.onflow.org",
  "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
  "app.detail.title": "FlowScanAI",
  "app.detail.icon": "https://flowscanai.vercel.app/icon.png",
  "flow.network": "testnet",
  
  // For mainnet deployment:
  // "accessNode.api": "https://rest-mainnet.onflow.org",
  // "discovery.wallet": "https://fcl-discovery.onflow.org/authn",
  // "flow.network": "mainnet",
});

// Contract addresses - update after deployment
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xf8d6e0586b0a20c7"; // placeholder testnet address

// Initialize user's Analyst resource if it doesn't exist
export const initializeAnalyst = async () => {
  try {
    const transactionId = await fcl.mutate({
      cadence: `
        import FlowScanAI from ${CONTRACT_ADDRESS}
        
        transaction() {
          prepare(signer: AuthAccount) {
            // Check if Analyst resource already exists
            if signer.borrow<&FlowScanAI.Analyst>(from: FlowScanAI.AnalystStoragePath) == nil {
              // Create and store the Analyst resource
              let analyst <- FlowScanAI.createAnalyst()
              signer.save(<-analyst, to: FlowScanAI.AnalystStoragePath)
              
              // Link public capability
              signer.link<&{FlowScanAI.AnalystPublic}>(
                FlowScanAI.AnalystPublicPath,
                target: FlowScanAI.AnalystStoragePath
              )
            }
          }
        }
      `,
      proposer: fcl.authz,
      payer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 9999,
    });

    return await fcl.tx(transactionId).onceSealed();
  } catch (error) {
    console.error("Error initializing analyst:", error);
    throw error;
  }
};

// Smart contract interaction functions
export const saveAnalysisToContract = async (
  txHash: string,
  aiSummary: string,
  riskScore: number,
  insights: string[],
  isPublic: boolean
) => {
  try {
    // First ensure user has Analyst resource
    await initializeAnalyst();
    
    const transactionId = await fcl.mutate({
      cadence: `
        import FlowScanAI from ${CONTRACT_ADDRESS}
        
        transaction(
          txHash: String,
          aiSummary: String, 
          riskScore: UInt8,
          insights: [String],
          isPublic: Bool
        ) {
          prepare(signer: AuthAccount) {
            let analyst = signer.borrow<&FlowScanAI.Analyst>(from: FlowScanAI.AnalystStoragePath)
              ?? panic("Could not borrow Analyst resource")
            
            analyst.storeAnalysis(
              txHash: txHash,
              aiSummary: aiSummary,
              riskScore: riskScore,
              insights: insights,
              isPublic: isPublic
            )
          }
        }
      `,
      args: (arg: any, t: any) => [
        arg(txHash, t.String),
        arg(aiSummary, t.String),
        arg(riskScore, t.UInt8),
        arg(insights, t.Array(t.String)),
        arg(isPublic, t.Bool),
      ],
      proposer: fcl.authz,
      payer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 9999,
    });

    console.log("Transaction ID:", transactionId);
    return await fcl.tx(transactionId).onceSealed();
  } catch (error) {
    console.error("Error saving analysis:", error);
    throw error;
  }
};

export const getUserProfile = async (address: string) => {
  try {
    const profile = await fcl.query({
      cadence: `
        import FlowScanAI from ${CONTRACT_ADDRESS}
        
        pub fun main(address: Address): FlowScanAI.UserProfile? {
          return FlowScanAI.getUserProfile(address: address)
        }
      `,
      args: (arg: any, t: any) => [arg(address, t.Address)],
    });

    return profile;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
};

export const likeAnalysis = async (txHash: string, analystAddress: string) => {
  try {
    // First ensure user has Analyst resource
    await initializeAnalyst();
    
    const transactionId = await fcl.mutate({
      cadence: `
        import FlowScanAI from ${CONTRACT_ADDRESS}
        
        transaction(txHash: String, analystAddress: Address) {
          prepare(signer: AuthAccount) {
            let analyst = signer.borrow<&FlowScanAI.Analyst>(from: FlowScanAI.AnalystStoragePath)
              ?? panic("Could not borrow Analyst resource")
            
            analyst.likeAnalysis(txHash: txHash, analystAddress: analystAddress)
          }
        }
      `,
      args: (arg: any, t: any) => [
        arg(txHash, t.String),
        arg(analystAddress, t.Address)
      ],
      proposer: fcl.authz,
      payer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 9999,
    });

    return await fcl.tx(transactionId).onceSealed();
  } catch (error) {
    console.error("Error liking analysis:", error);
    throw error;
  }
};

// Get a public analysis by transaction hash and analyst address
export const getPublicAnalysis = async (txHash: string, analystAddress: string) => {
  try {
    const analysis = await fcl.query({
      cadence: `
        import FlowScanAI from ${CONTRACT_ADDRESS}
        
        pub fun main(txHash: String, analystAddress: Address): FlowScanAI.AnalysisData? {
          return FlowScanAI.getPublicAnalysis(txHash: txHash, analystAddress: analystAddress)
        }
      `,
      args: (arg: any, t: any) => [
        arg(txHash, t.String),
        arg(analystAddress, t.Address)
      ],
    });

    return analysis;
  } catch (error) {
    console.error("Error fetching analysis:", error);
    return null;
  }
};

// Get all public analyses (for discovery feed)
export const getPublicAnalyses = async () => {
  try {
    const analyses = await fcl.query({
      cadence: `
        import FlowScanAI from ${CONTRACT_ADDRESS}
        
        pub fun main(): [String] {
          return FlowScanAI.getPublicAnalyses()
        }
      `,
    });

    return analyses;
  } catch (error) {
    console.error("Error fetching public analyses:", error);
    return [];
  }
};

// Get contract statistics
export const getContractStats = async () => {
  try {
    const stats = await fcl.query({
      cadence: `
        import FlowScanAI from ${CONTRACT_ADDRESS}
        
        pub fun main(): {String: UInt64} {
          return FlowScanAI.getStats()
        }
      `,
    });

    return stats;
  } catch (error) {
    console.error("Error fetching contract stats:", error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (username: string) => {
  try {
    const transactionId = await fcl.mutate({
      cadence: `
        import FlowScanAI from ${CONTRACT_ADDRESS}
        
        transaction(username: String) {
          prepare(signer: AuthAccount) {
            FlowScanAI.updateProfile(username: username)
          }
        }
      `,
      args: (arg: any, t: any) => [arg(username, t.String)],
      proposer: fcl.authz,
      payer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 9999,
    });

    return await fcl.tx(transactionId).onceSealed();
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

// Authentication helpers
export const authenticate = () => fcl.logIn();
export const logout = () => fcl.unauthenticate();
export const getCurrentUser = () => fcl.currentUser.snapshot();

// Subscribe to authentication state
export const subscribeToAuth = (callback: (user: any) => void) => {
  return fcl.currentUser.subscribe(callback);
};