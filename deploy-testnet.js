const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Network configurations
const NETWORKS = {
  zetachainAthens: {
    name: "ZetaChain Athens Testnet",
    gateway: "0x6c533f7fe93fae114d0954697069df33c9b74fd7",
    explorer: "https://athens3.explorer.zetachain.com",
    faucet: "https://labs.zetachain.com/get-zeta"
  },
  sepolia: {
    name: "Ethereum Sepolia Testnet",
    gateway: "0x0000000000000000000000000000000000000000", // Placeholder
    explorer: "https://sepolia.etherscan.io",
    faucet: "https://sepoliafaucet.com"
  },
  bscTestnet: {
    name: "BSC Testnet",
    gateway: "0x0000000000000000000000000000000000000000", // Placeholder
    explorer: "https://testnet.bscscan.com",
    faucet: "https://testnet.binance.org/faucet-smart"
  },
  mumbai: {
    name: "Polygon Mumbai Testnet",
    gateway: "0x0000000000000000000000000000000000000000", // Placeholder
    explorer: "https://mumbai.polygonscan.com",
    faucet: "https://faucet.polygon.technology"
  }
};

async function main() {
  const networkName = hre.network.name;
  const networkConfig = NETWORKS[networkName];

  if (!networkConfig) {
    console.error(`❌ Network ${networkName} not configured`);
    process.exit(1);
  }

  console.log(`\n🚀 Deploying to ${networkConfig.name}...`);
  console.log(`📍 Network: ${networkName}`);
  console.log(`⛓️  Chain ID: ${hre.network.config.chainId}\n`);

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);

  console.log(`👤 Deployer: ${deployer.address}`);
  console.log(`💰 Balance: ${hre.ethers.formatEther(balance)} ${networkName === 'zetachainAthens' ? 'ZETA' : 'ETH'}\n`);

  if (balance === 0n) {
    console.error(`❌ Insufficient balance. Get testnet tokens from:`);
    console.error(`   ${networkConfig.faucet}\n`);
    process.exit(1);
  }

  try {
    // Deploy contract
    console.log("📦 Deploying OmnichainTracker...");
    const OmnichainTracker = await hre.ethers.getContractFactory("OmnichainTracker");
    const tracker = await OmnichainTracker.deploy(networkConfig.gateway);
    
    await tracker.waitForDeployment();
    const contractAddress = await tracker.getAddress();

    console.log("\n✅ Deployment Successful!");
    console.log(`📍 Contract Address: ${contractAddress}`);
    console.log(`🌐 Gateway Address: ${networkConfig.gateway}`);
    console.log(`🔗 Explorer: ${networkConfig.explorer}/address/${contractAddress}\n`);

    // Save deployment info
    const deploymentInfo = {
      network: networkName,
      networkName: networkConfig.name,
      chainId: hre.network.config.chainId,
      contractAddress: contractAddress,
      gatewayAddress: networkConfig.gateway,
      deployer: deployer.address,
      explorer: networkConfig.explorer,
      deployedAt: new Date().toISOString(),
      txHash: tracker.deploymentTransaction()?.hash
    };

    const deploymentsDir = path.join(__dirname, "deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir);
    }

    const filename = `${networkName}-${Date.now()}.json`;
    fs.writeFileSync(
      path.join(deploymentsDir, filename),
      JSON.stringify(deploymentInfo, null, 2)
    );

    // Update latest deployment
    fs.writeFileSync(
      path.join(deploymentsDir, `${networkName}-latest.json`),
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("📝 Deployment info saved to:");
    console.log(`   deployments/${filename}`);
    console.log(`   deployments/${networkName}-latest.json\n`);

    // Update app.js if deploying to ZetaChain
    if (networkName === 'zetachainAthens') {
      try {
        const appJsPath = path.join(__dirname, "app.js");
        let appJsContent = fs.readFileSync(appJsPath, "utf8");
        
        const oldLine = /this\.CONTRACT_ADDRESS = "[^"]*";/;
        const newLine = `this.CONTRACT_ADDRESS = "${contractAddress}";`;
        
        appJsContent = appJsContent.replace(oldLine, newLine);
        fs.writeFileSync(appJsPath, appJsContent);
        
        console.log("✅ Updated app.js with new contract address\n");
      } catch (error) {
        console.log("⚠️  Could not auto-update app.js. Please update manually.\n");
      }
    }

    console.log("🎉 Next Steps:");
    console.log(`1. Verify contract: npx hardhat verify --network ${networkName} ${contractAddress} ${networkConfig.gateway}`);
    console.log(`2. Update frontend with contract address: ${contractAddress}`);
    console.log(`3. Test all functions on ${networkConfig.name}`);
    console.log(`4. Get testnet tokens: ${networkConfig.faucet}\n`);

  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
