const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Deploy UniversalPortfolioTracker with Gateway Integration
 * For Hackathon Bounty #1: Universal App
 */
async function main() {
    console.log("\n🚀 Deploying UniversalPortfolioTracker (Bounty #1: Universal App)...\n");
    
    const [deployer] = await hre.ethers.getSigners();
    const network = hre.network.name;
    
    console.log("Network:", network);
    console.log("Deployer:", deployer.address);
    console.log("Balance:", hre.ethers.utils.formatEther(await deployer.getBalance()), "ETH\n");
    
    // Gateway addresses for different networks
    const gatewayAddresses = {
        zetachainAthens: "0x6c533f7fe93fae114d0954697069df33c9b74fd7",
        sepolia: "0x0000000000000000000000000000000000000000", // Update with actual
        bscTestnet: "0x0000000000000000000000000000000000000000", // Update with actual
        mumbai: "0x0000000000000000000000000000000000000000" // Update with actual
    };
    
    const gatewayAddress = gatewayAddresses[network] || gatewayAddresses.zetachainAthens;
    
    console.log("Gateway Address:", gatewayAddress);
    console.log("\n⏳ Deploying contract...\n");
    
    // Deploy contract
    const UniversalPortfolioTracker = await hre.ethers.getContractFactory("UniversalPortfolioTracker");
    const tracker = await UniversalPortfolioTracker.deploy(gatewayAddress);
    
    await tracker.deployed();
    
    console.log("✅ UniversalPortfolioTracker deployed to:", tracker.address);
    console.log("\n📋 Contract Details:");
    console.log("   - Gateway:", await tracker.gateway());
    console.log("   - Owner:", await tracker.owner());
    console.log("   - NFT Name:", await tracker.name());
    console.log("   - NFT Symbol:", await tracker.symbol());
    
    // Save deployment info
    const deploymentInfo = {
        network: network,
        contractAddress: tracker.address,
        gatewayAddress: gatewayAddress,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        blockNumber: tracker.deployTransaction.blockNumber,
        transactionHash: tracker.deployTransaction.hash,
        bounty: "Universal App - onCall, onRevert, onAbort Implementation"
    };
    
    const deploymentsDir = path.join(__dirname, "deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir);
    }
    
    const filename = `universal-${network}-${Date.now()}.json`;
    fs.writeFileSync(
        path.join(deploymentsDir, filename),
        JSON.stringify(deploymentInfo, null, 2)
    );
    
    fs.writeFileSync(
        path.join(deploymentsDir, `universal-${network}-latest.json`),
        JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("\n💾 Deployment info saved to:", filename);
    
    console.log("\n🎯 Next Steps:");
    console.log("1. Update CONTRACT_ADDRESS in app.js:");
    console.log(`   this.CONTRACT_ADDRESS = "${tracker.address}";`);
    console.log("\n2. Verify contract (optional):");
    console.log(`   npx hardhat verify --network ${network} ${tracker.address} ${gatewayAddress}`);
    console.log("\n3. Test the Universal App functions:");
    console.log("   - Create position");
    console.log("   - Withdraw cross-chain (triggers onCall)");
    console.log("   - Test revert scenario (triggers onRevert)");
    console.log("   - Test abort scenario (triggers onAbort)");
    console.log("\n4. View on explorer:");
    
    const explorers = {
        zetachainAthens: `https://athens3.explorer.zetachain.com/address/${tracker.address}`,
        sepolia: `https://sepolia.etherscan.io/address/${tracker.address}`,
        bscTestnet: `https://testnet.bscscan.com/address/${tracker.address}`,
        mumbai: `https://mumbai.polygonscan.com/address/${tracker.address}`
    };
    
    console.log(`   ${explorers[network] || explorers.zetachainAthens}`);
    
    console.log("\n✨ Deployment complete!\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
