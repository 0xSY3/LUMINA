# 🌟 Lumina - AI-Powered Blockchain Intelligence Platform

<div align="center">

[![Flow](https://img.shields.io/badge/Built%20on-Flow-00EF8B?style=for-the-badge&logo=flow&logoColor=white)](https://flow.com)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://typescript.org)
[![OpenAI](https://img.shields.io/badge/OpenAI-API-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com)

**Making Web3 accessible to millions through intelligent blockchain analysis**

</div>

---

## 💡 **Description**

**Lumina illuminates the blockchain by providing AI-powered, human-readable analysis of Flow transactions that anyone can understand, making Web3 accessible to millions through intelligent insights.**

Lumina transforms complex blockchain data into digestible insights through AI, similar to how ChatGPT made AI accessible to hundreds of millions. By removing technical barriers, we enable:

- **🚀 Mass Adoption**: Anyone can understand blockchain transactions without technical knowledge
- **💎 Consumer-Friendly**: Beautiful UI with conversational AI explanations  
- **⚡ Real-time Intelligence**: Instant analysis of Flow EVM transactions with MEV detection and security assessment
- **🎓 Educational Impact**: Helps users learn blockchain concepts through AI-guided exploration
- **🔮 Predictive Analytics**: AI-powered risk assessment and transaction pattern prediction

---

## 🌊 Flow Integration

### **What we integrated with Flow:**
- **🔗 Flow EVM Networks**: Direct integration with Flow Mainnet (747) and Testnet (545) 
- **📜 Cadence Smart Contract**: Native Flow smart contract for storing AI analyses on-chain
- **🔐 Flow FCL Integration**: Wallet connection and transaction signing via Flow Client Library
- **📊 Real-time Data**: Live blockchain data fetching from Flow EVM nodes
- **🤖 Smart Contract Analysis**: AI-powered analysis of contract interactions and events
- **👥 Social Features**: On-chain reputation system and analysis sharing

### **How it was implemented:**
1. **Smart Contract**: Cadence contract with resource-oriented programming for analysis storage
2. **FCL Integration**: Complete wallet connection and blockchain interaction setup
3. **Blockchain Connection**: Using Viem with Flow EVM RPC endpoints
4. **Transaction Analysis**: Custom AI system that understands Flow transaction patterns
5. **Security Assessment**: MEV detection and risk analysis specific to Flow ecosystem
6. **User Experience**: Flow-themed design with glassmorphism effects and smooth animations

---

## 🛠 Technical Architecture

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | Next.js 14+ with TypeScript and Tailwind CSS | Modern, type-safe web application |
| **Smart Contract** | Cadence smart contract deployed on Flow blockchain | On-chain analysis storage |
| **Blockchain** | Flow EVM integration via Viem + Flow FCL | Native Flow transactions |
| **AI** | OpenAI GPT-4 with custom Flow blockchain analysis prompts | Intelligent transaction analysis |
| **Visualization** | Mermaid diagrams for transaction flow visualization | Visual transaction understanding |
| **Real-time** | Live data polling with automatic refresh | Up-to-date blockchain information |
| **Storage** | On-chain analysis storage with user reputation system | Decentralized data persistence |

---

## 🎯 Features

### 🔍 **Core Capabilities**
- **🧠 AI Transaction Analysis**: Deep insights into any Flow transaction
- **💾 Blockchain Storage**: Save analyses permanently on Flow blockchain
- **👥 Social Features**: Like, share, and discover public analyses
- **🏆 User Profiles**: Reputation system based on community engagement
- **🔗 Wallet Integration**: Seamless Flow wallet connection via FCL

### 📊 **Visualization & Analytics**
- **🌊 Visual Flow Diagrams**: Mermaid charts showing transaction flows
- **🛡️ Security Assessment**: Risk analysis and MEV detection
- **📈 Live Dashboard**: Real-time Flow blockchain statistics
- **📚 Educational**: Makes blockchain concepts accessible to everyone
- **🔮 Predictive Intelligence**: AI-powered forecasting and risk prediction

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ and npm
- OpenAI API key
- Flow wallet for testing

### **Installation**

```bash
# 1. Clone the repository
git clone https://github.com/0xSY3/LUMINA.git
cd lumina

# 2. Install dependencies
npm install

# 3. Set up environment variables (OpenAI API key)
cp .env.example .env.local
# Edit .env.local with your API key

# 4. Run development server
npm run dev

# 5. Open http://localhost:3000
```

---

## 📝 Environment Variables

Create a `.env.local` file:

```env
# Required
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_CONTRACT_ADDRESS=

# Optional
NEXT_PUBLIC_FLOW_NETWORK=
NEXT_PUBLIC_DEBUG_MODE=false
```

See `.env.example` for all available configuration options.

---

## 📖 Usage Guide

### **🔍 Analyze Transactions**
1. Connect your Flow wallet
2. Paste any Flow transaction hash
3. Get AI-powered analysis with risk assessment
4. Save analysis on-chain or share with community

### **👥 Social Features**
- Browse public analyses from the community
- Like and share insightful analyses
- Build reputation through quality contributions
- Create your analyst profile

### **📊 Dashboard**
- View real-time Flow blockchain statistics
- Explore transaction patterns and trends
- Monitor security alerts and risk assessments

---

## 🔮 Future Roadmap

### **✅ Phase 1: Core Features** (Completed)
- [x] AI-powered transaction analysis
- [x] Flow EVM integration
- [x] Smart contract deployment
- [x] Social features for sharing transaction insights

### **🚧 Phase 2: Advanced Analytics** (In Progress)
- [ ] Advanced analytics dashboard with historical trends
- [ ] Agent-based monitoring and alerts for suspicious transactions
- [ ] Machine learning models for pattern recognition
- [ ] Integration with Flow DeFi protocols for yield analysis

### **🔜 Phase 3: Platform Expansion** (Planned)
- [ ] Multi-chain expansion beyond Flow EVM
- [ ] Mobile app for on-the-go blockchain analysis
- [ ] AI-powered portfolio optimization and yield farming strategies
- [ ] Enterprise features and API access

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

```bash
# Fork the repository
git clone https://github.com/0xSY3/LUMINA.git

# Create a feature branch
git checkout -b feature/amazing-feature

# Make your changes and commit
git commit -m "Add amazing feature"

# Push to your fork and create a pull request
git push origin feature/amazing-feature
```

### **Development Guidelines**
- Follow TypeScript best practices
- Write tests for new features
- Update documentation as needed
- Follow the existing code style


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**🌊 Built with ❤️ for the Flow ecosystem**

*Built for Flow's "Most Killer App Potential" challenge - illuminating blockchain data through AI-powered intelligence.*

</div>
