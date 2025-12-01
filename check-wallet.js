const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(signer.address);
  
  console.log(`\n💰 Wallet Address: ${signer.address}`);
  console.log(`💵 Balance: ${hre.ethers.formatEther(balance)} ZETA`);
  
  const deploymentPath = path.join(__dirname, "deployments", `${hre.network.name}-latest.json`);
  if (fs.existsSync(deploymentPath)) {
    const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
    const OmnichainTracker = await hre.ethers.getContractFactory("OmnichainTracker");
    const tracker = OmnichainTracker.attach(deployment.contractAddress);
    
    const positions = await tracker.getUserPositions(signer.address);
    console.log(`📊 Your Positions: ${positions.length}`);
    
    if (positions.length > 0) {
      console.log(`\nPosition Details:`);
      for (let i = 0; i < positions.length; i++) {
        const pos = positions[i];
        console.log(`  Position ${i}:`);
        console.log(`    Amount: ${hre.ethers.formatEther(pos.amount)} ZETA`);
        console.log(`    Status: ${pos.status === 0n ? 'Active' : pos.status === 1n ? 'Withdrawn' : 'Emergency'}`);
      }
    }
  }
  console.log();
}

main();
