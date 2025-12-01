# ZetaChain Universal Portfolio Tracker

A Universal App for cross-chain portfolio management with automatic revert protection and NFT rewards. Built on ZetaChain with full Gateway integration supporting EVM and non-EVM chains.

## Features

- **Universal App**: Gateway integration with `onCall`, `onRevert`, and `onAbort` callbacks
- **Multi-Chain Support**: EVM (Ethereum, BSC, Polygon) + Non-EVM (Solana, Sui, TON)
- **Revert Resilience**: 100% automatic refunds on failed cross-chain transactions
- **Universal NFT**: Mint Safety Badge once, transfer to any supported chain
- **Safety Buffer**: 30% gas premium for reliable cross-chain operations

## Quick Start

### Prerequisites
- Node.js v16+
- MetaMask wallet
- ZETA tokens from [faucet](https://labs.zetachain.com/get-zeta)

### Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add your PRIVATE_KEY to .env

# Deploy contract
npm run deploy:universal

# Update contract address in app.js (line 11)
# this.CONTRACT_ADDRESS = "0xYOUR_DEPLOYED_ADDRESS";

# Start application
npm start
# Open http://localhost:8000
```

## Usage

### 1. Deposit ZETA
- Connect MetaMask to ZetaChain Athens (Chain ID: 7001)
- Enter amount and create position

### 2. Cross-Chain Withdraw
- Select position
- Choose destination chain (Ethereum, BSC, Polygon, Solana, Sui, or TON)
- Enter recipient address
- Set gas limit (≥150000 for success, <150000 to test revert)
- Confirm withdrawal

### 3. NFT Rewards
- Mint Safety Badge after using safety buffer
- Transfer badge to any supported chain

## Smart Contract

### Universal App Functions

```solidity
// Handle successful cross-chain calls
function onCall(
    bytes calldata context,
    address zrc20,
    uint256 amount,
    bytes calldata message
) external onlyGateway returns (bytes4)

// Automatic refunds on failures
function onRevert(
    bytes calldata context,
    address zrc20,
    uint256 amount,
    bytes calldata message
) external onlyGateway

// Handle aborted transactions
function onAbort(
    bytes calldata context,
    address zrc20,
    uint256 amount,
    bytes calldata message
) external onlyGateway
```

### Core Functions

- `deposit(uint256 amount)` - Create position
- `withdrawAndTrack(positionId, chainId, address, gasLimit)` - Cross-chain withdrawal
- `mintSafetyBadge()` - Mint Universal NFT
- `transferBadgeCrossChain(tokenId, chainId)` - Transfer NFT cross-chain
- `getUserPositions(address)` - View all positions
- `isEligibleForBadge(address)` - Check NFT eligibility

## Supported Chains

### EVM Chains
- Ethereum Sepolia (11155111)
- BSC Testnet (97)
- Polygon Mumbai (80001)

### Non-EVM Chains
- Solana Devnet (18000001)
- Sui Testnet (18000002)
- TON Testnet (18000003)

## Architecture

### Gateway Integration
The ZetaChain Gateway handles all cross-chain complexity:
- Address format conversion (EVM ↔ Solana ↔ Sui ↔ TON)
- Message routing through validators
- Callback execution (`onCall`/`onRevert`/`onAbort`)

### Position States
- **Active**: Ready for withdrawal
- **Pending**: Cross-chain transaction in progress
- **Withdrawn**: Successfully completed (onCall)
- **Refunded**: Failed and refunded (onRevert)
- **Failed**: Aborted (onAbort)

### Safety Mechanism
30% volatility premium prevents gas estimation failures:
```
Base Gas: 0.001 ZETA
Safety Buffer: 0.0003 ZETA (30%)
Total: 0.0013 ZETA
```

## Development

### Deploy Commands

```bash
# Universal App (with Gateway)
npm run deploy:universal              # ZetaChain Athens
npm run deploy:universal:sepolia      # Ethereum Sepolia
npm run deploy:universal:bsc          # BSC Testnet
npm run deploy:universal:mumbai       # Polygon Mumbai

# Original Contract
npm run deploy:zeta                   # ZetaChain Athens
```

### Testing

```bash
npm run test:zeta        # Test on ZetaChain
npm run check            # Diagnostic check
```

### Project Structure

```
├── contracts/
│   ├── OmnichainTracker.sol           # Original contract
│   └── UniversalPortfolioTracker.sol  # Universal App with Gateway
├── deployments/                        # Deployment artifacts
├── index.html                          # Frontend UI
├── app.js                              # Frontend logic
├── styles.css                          # Styling
├── hardhat.config.js                   # Network configuration
├── deploy-universal.js                 # Deployment script
└── package.json                        # Dependencies
```

## Network Configuration

### ZetaChain Athens Testnet
- Chain ID: 7001
- RPC: https://zetachain-athens-evm.blockpi.network/v1/rpc/public
- Explorer: https://athens3.explorer.zetachain.com/
- Faucet: https://labs.zetachain.com/get-zeta

## Troubleshooting

### "Internal JSON-RPC error"
- Get ZETA from faucet
- Verify MetaMask is on ZetaChain Athens (Chain ID: 7001)

### Contract not found
- Update `CONTRACT_ADDRESS` in app.js with deployed address

### Transaction fails
- Check ZETA balance
- Try smaller amount (0.001 ZETA)
- Verify correct network

### Run diagnostics
```bash
npm run check
```

## Testing Scenarios

### Test onCall (Success)
1. Create position (0.1 ZETA)
2. Withdraw with gasLimit ≥ 150000
3. Verify status changes to "Withdrawn"

### Test onRevert (Failure)
1. Create position (0.1 ZETA)
2. Withdraw with gasLimit < 150000
3. Verify automatic refund
4. Verify status changes to "Refunded"

### Test NFT
1. Complete withdrawal (triggers eligibility)
2. Mint Safety Badge
3. Transfer to another chain

## Security

- **Gateway-Only Access**: All Universal App functions protected by `onlyGateway` modifier
- **Duplicate Prevention**: Message hash tracking prevents replay attacks
- **State Machine**: Clear position status transitions prevent invalid states
- **Automatic Refunds**: No user funds lost on failures

## Dependencies

```json
{
  "dependencies": {
    "@zetachain/protocol-contracts": "^11.0.0-rc1",
    "@openzeppelin/contracts": "^5.0.0",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "@nomicfoundation/hardhat-toolbox": "^5.0.0",
    "hardhat": "^2.22.0"
  }
}
```

## Resources

- [ZetaChain Documentation](https://www.zetachain.com/docs/)
- [Universal Apps Guide](https://www.zetachain.com/docs/developers/omnichain/universal-apps/)
- [Gateway Documentation](https://www.zetachain.com/docs/developers/omnichain/gateway/)
- [Testnet Faucet](https://labs.zetachain.com/get-zeta)
- [Block Explorer](https://athens3.explorer.zetachain.com/)

## License

MIT

## Acknowledgments

Built with Amazon Q Developer for the ZetaChain Hackathon.

---

**Get Started:** `npm install && npm run deploy:universal && npm start`
