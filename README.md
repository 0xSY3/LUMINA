# Lumina - AI-Powered Blockchain Intelligence Platform

**Description:** Lumina illuminates the blockchain by providing AI-powered, human-readable analysis of Flow transactions that anyone can understand, making Web3 accessible to millions through intelligent insights.

Lumina transforms complex blockchain data into digestible insights through AI, similar to how ChatGPT made AI accessible to hundreds of millions. By removing technical barriers, we enable:

- **Mass Adoption**: Anyone can understand blockchain transactions without technical knowledge
- **Consumer-Friendly**: Beautiful UI with conversational AI explanations
- **Real-time Intelligence**: Instant analysis of Flow EVM transactions with MEV detection and security assessment
- **Educational Impact**: Helps users learn blockchain concepts through AI-guided exploration
- **Predictive Analytics**: AI-powered risk assessment and transaction pattern prediction

## 🌊 Flow Integration

### What we integrated with Flow:
- **Flow EVM Networks**: Direct integration with Flow Mainnet (747) and Testnet (545) 
- **Cadence Smart Contract**: Native Flow smart contract for storing AI analyses on-chain
- **Flow FCL Integration**: Wallet connection and transaction signing via Flow Client Library
- **Real-time Data**: Live blockchain data fetching from Flow EVM nodes
- **Smart Contract Analysis**: AI-powered analysis of contract interactions and events
- **Social Features**: On-chain reputation system and analysis sharing

### How it was implemented:
1. **Smart Contract**: Cadence contract with resource-oriented programming for analysis storage
2. **FCL Integration**: Complete wallet connection and blockchain interaction setup
3. **Blockchain Connection**: Using Viem with Flow EVM RPC endpoints
4. **Transaction Analysis**: Custom AI system that understands Flow transaction patterns
5. **Security Assessment**: MEV detection and risk analysis specific to Flow ecosystem
6. **User Experience**: Flow-themed design with glassmorphism effects and smooth animations

## 🛠 Technical Architecture

- **Frontend**: Next.js 14+ with TypeScript and Tailwind CSS
- **Smart Contract**: Cadence smart contract deployed on Flow blockchain
- **Blockchain**: Flow EVM integration via Viem + Flow FCL for native transactions
- **AI**: OpenAI GPT-4 with custom Flow blockchain analysis prompts
- **Visualization**: Mermaid diagrams for transaction flow visualization
- **Real-time**: Live data polling with automatic refresh
- **Storage**: On-chain analysis storage with user reputation system

## 🎯 Features

- **AI Transaction Analysis**: Deep insights into any Flow transaction
- **Blockchain Storage**: Save analyses permanently on Flow blockchain
- **Social Features**: Like, share, and discover public analyses
- **User Profiles**: Reputation system based on community engagement
- **Wallet Integration**: Seamless Flow wallet connection via FCL
- **Visual Flow Diagrams**: Mermaid charts showing transaction flows
- **Security Assessment**: Risk analysis and MEV detection
- **Live Dashboard**: Real-time Flow blockchain statistics
- **Educational**: Makes blockchain concepts accessible to everyone
- **Predictive Intelligence**: AI-powered forecasting and risk prediction



## 🚀 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (OpenAI API key)
4. Run development server: `npm run dev`
5. Open http://localhost:3000


## 📝 Environment Variables

Create a `.env.local` file:

```env
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_CONTRACT_ADDRESS=0xf8d6e0586b0a20c7
```

See `.env.example` for all available configuration options.

## 🔮 Future Roadmap

- ✅ Social features for sharing transaction insights  
- Advanced analytics dashboard with historical trends
- Agent-based monitoring and alerts for suspicious transactions
- Multi-chain expansion beyond Flow EVM
- Mobile app for on-the-go blockchain analysis
- Machine learning models for pattern recognition
- Integration with Flow DeFi protocols for yield analysis
- AI-powered portfolio optimization and yield farming strategies

---

*Built for Flow's "Most Killer App Potential" challenge - illuminating blockchain data through AI-powered intelligence.*
