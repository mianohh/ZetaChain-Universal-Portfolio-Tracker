# ZetaChain Omnichain Portfolio Tracker (Lite)

A cross-chain DeFi portfolio tracker and safety dashboard built on ZetaChain. This "Lite" mainnet release features **Standard Protection** protocols and the exclusive **Genesis Tier** Safety Badge for early adopters.

## 🛡️ Core Features

* **Genesis Tier Badges**: Exclusive "Proof of Protection" NFTs for early mainnet users.
* **Standard Protection**: 30% static gas buffer ensuring safe cross-chain withdrawals on public infrastructure.
* **Revert Resilience**: Automatic refund mechanism if cross-chain calls fail due to extreme volatility.
* **Omnichain Dashboard**: Track and manage positions across ZetaChain, Ethereum, BSC, and Polygon from a single interface.
* **Universal NFT**: Mint your Genesis Badge once on ZetaChain and transfer it to any supported chain.

> **Note:** This Lite version operates on public RPC infrastructure. The **Volatility Armor** upgrade (Real-time dynamic buffering via Goldsky) is scheduled for a future release.

## 🚀 Quick Start (Mainnet)

### Prerequisites

* Node.js v16+
* MetaMask wallet configured for **ZetaChain Mainnet**
* Native **ZETA** tokens for gas ([Get ZETA](https://www.zetachain.com/docs/users/zetahub/get-zeta/))

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Add your PRIVATE_KEY to .env (Ensure account has real ZETA)

# Deploy to ZetaChain Mainnet
npm run deploy:mainnet

# Update contract address in app.js (line 11)
# this.CONTRACT_ADDRESS = "YOUR_MAINNET_CONTRACT_ADDRESS";

# Start production server
npm start
```

## 📖 User Guide

### 1. Connect & Sync

Connect your wallet to the ZetaChain Mainnet. The dashboard will automatically sync your active positions.

### 2. Create Position

Deposit ZETA to create a tracked cross-chain position.

* *Gas Note: Uses standard mainnet gas estimation.*

### 3. Safe Withdrawal (Standard Protection)

Execute a cross-chain withdrawal to any connected network.

* **Mechanism:** The protocol applies a **30% static safety buffer** to your transaction to mitigate gas spikes on the destination chain.
* **Refunds:** If the transaction fails, funds are automatically returned to your ZetaChain balance.

### 4. Mint "Genesis Tier" Badge

After your first successful safe withdrawal, you unlock eligibility for the **Genesis Safety Badge**.

* **Utility:** This badge proves your early adoption and serves as the "Key" for future premium features.

### 5. Cross-Chain Transfer

Transfer your Genesis Badge to Ethereum, BSC, or Polygon to prove your safety status across the ecosystem.

## 🔧 Smart Contract Functions

### Core Logic

* `deposit()`: Initialize a tracked position on ZetaChain.
* `withdrawAndTrack(positionId, destinationChainId, recipient)`: Execute withdrawal with Standard Protection buffer.
* `emergencyWithdraw(positionId)`: Safety hatch to recover funds if stuck.

### Genesis NFT Logic

* `mintSafetyBadge()`: Mint the Genesis Tier NFT (requires eligibility).
* `transferBadgeCrossChain()`: Bridge the NFT to other chains via ZetaChain's omnichain layer.
* `hasUsedSafetyBuffer(user)`: Verifies if user has successfully utilized the protection layer.

## 🌐 Network Configuration

### ZetaChain Mainnet Beta (Primary)

* **Chain ID**: `7000`
* **RPC**: `https://zetachain-evm.blockpi.network/v1/rpc/public`
* **Explorer**: `https://zetachain.blockscout.com/`
* **Symbol**: `ZETA`

### Supported Destination Chains (Mainnet)

* **Ethereum**: Chain ID `1`
* **BSC**: Chain ID `56`
* **Polygon**: Chain ID `137`

## 🛠️ Development & Deployment

### Build

```bash
npx hardhat compile
```

### Deployment Scripts

```bash
# Mainnet Deployment
npm run deploy:mainnet

# Testnet Fallback (Athens)
npm run deploy:testnet
```

### Diagnostic Tools

Run the lightweight check script to verify RPC connectivity before deployment:

```bash
npm run check
```

## 🏗️ Architecture (Lite)

### Smart Contract

* **Standard Protection**: Uses static 30% buffer logic (upgradable to Dynamic Volatility Premium).
* **ERC-721**: Implements Universal NFT standard for the Genesis Badge.
* **Revert Handlers**: `onRevert` callbacks ensure atomic safety even on public RPCs.

### Frontend

* **Status**: "Standard Protection" mode active.
* **Theme**: Production dark mode (#0a0b0d) with Genesis Gold accents.

## 📦 Dependencies

```json
{
  "dependencies": {
    "@zetachain/protocol-contracts": "^3.0.0",
    "@openzeppelin/contracts": "^5.0.0",
    "dotenv": "^16.0.0",
    "ethers": "^6.0.0"
  }
}
```

## 📄 License

MIT

---

**Status**: 🟢 **Mainnet Live (Lite)** | **Genesis Minting Active**
