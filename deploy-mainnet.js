const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("\n🚀 Deploying to ZetaChain Mainnet Beta...\n");
    
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "ZETA");
    
    if (balance < hre.ethers.parseEther("0.1")) {
        console.warn("⚠️  WARNING: Low balance. Ensure you have enough ZETA for deployment.");
    }
    
    const GATEWAY_ADDRESS = "0x6c533f7fe93fae114d0954697069df33c9b74fd7";
    
    console.log("\n📋 Deployment Configuration:");
    console.log("   Network:", hre.network.name);
    console.log("   Chain ID:", (await hre.ethers.provider.getNetwork()).chainId);
    console.log("   Gateway:", GATEWAY_ADDRESS);
    console.log("   Mode: Standard Protection (30% static gas buffer)");
    
    console.log("\n⏳ Deploying OmnichainTrackerMainnet...");
    
    const OmnichainTrackerMainnet = await hre.ethers.getContractFactory("OmnichainTrackerMainnet");
    const contract = await OmnichainTrackerMainnet.deploy(GATEWAY_ADDRESS);
    
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    
    console.log("\n✅ Contract deployed successfully!");
    console.log("   Address:", contractAddress);
    console.log("   Transaction:", contract.deploymentTransaction().hash);
    
    const deploymentInfo = {
        network: hre.network.name,
        chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
        contractAddress: contractAddress,
        gatewayAddress: GATEWAY_ADDRESS,
        deployer: deployer.address,
        deploymentTx: contract.deploymentTransaction().hash,
        timestamp: new Date().toISOString(),
        mode: "Standard Protection (30% gas buffer)"
    };
    
    const deploymentsDir = path.join(__dirname, 'deployments');
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    const filename = `mainnet-${Date.now()}.json`;
    fs.writeFileSync(
        path.join(deploymentsDir, filename),
        JSON.stringify(deploymentInfo, null, 2)
    );
    
    fs.writeFileSync(
        path.join(deploymentsDir, 'mainnet-latest.json'),
        JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("\n💾 Deployment info saved to:", filename);
    
    console.log("\n" + "=".repeat(80));
    console.log("📝 VERIFICATION ARGUMENTS");
    console.log("=".repeat(80));
    console.log("\nConstructor Arguments:");
    console.log(GATEWAY_ADDRESS);
    console.log("\nVerification Command:");
    console.log(`npx hardhat verify --network zeta_mainnet ${contractAddress} "${GATEWAY_ADDRESS}"`);
    console.log("\n" + "=".repeat(80));
    
    console.log("\n📋 NEXT STEPS:");
    console.log("=".repeat(80));
    console.log("1. Update app.js line 13:");
    console.log(`   this.CONTRACT_ADDRESS = "${contractAddress}";`);
    console.log("\n2. Verify contract:");
    console.log(`   https://explorer.zetachain.com/address/${contractAddress}`);
    console.log("\n3. Start frontend: npm start");
    console.log("=".repeat(80));
    
    console.log("\n✨ Deployment complete!\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Deployment failed:");
        console.error(error);
        process.exit(1);
    });
