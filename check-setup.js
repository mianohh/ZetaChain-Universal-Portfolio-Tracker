// Quick Setup Diagnostic Script
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n🔍 ZetaChain Portfolio Tracker - Setup Diagnostic\n");
  console.log("=".repeat(60));

  let issues = [];
  let warnings = [];

  // Check 1: Network Configuration
  console.log("\n1️⃣  Checking Network Configuration...");
  try {
    const network = hre.network.name;
    const chainId = hre.network.config.chainId;
    console.log(`   ✅ Network: ${network}`);
    console.log(`   ✅ Chain ID: ${chainId}`);
    
    if (network !== 'zetachainAthens') {
      warnings.push('Not on zetachainAthens network');
    }
  } catch (error) {
    issues.push('Network configuration error');
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Check 2: Wallet Balance
  console.log("\n2️⃣  Checking Wallet Balance...");
  try {
    const [signer] = await hre.ethers.getSigners();
    const address = await signer.getAddress();
    const balance = await hre.ethers.provider.getBalance(address);
    const balanceInEther = hre.ethers.formatEther(balance);
    
    console.log(`   ✅ Address: ${address}`);
    console.log(`   ✅ Balance: ${balanceInEther} ZETA`);
    
    if (parseFloat(balanceInEther) < 0.01) {
      issues.push('Insufficient ZETA balance (need at least 0.01 ZETA)');
      console.log(`   ⚠️  Low balance! Get ZETA from: https://labs.zetachain.com/get-zeta`);
    }
  } catch (error) {
    issues.push('Cannot check wallet balance');
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Check 3: Contract Deployment
  console.log("\n3️⃣  Checking Contract Deployment...");
  try {
    const deploymentPath = path.join(__dirname, "deployments", "zetachainAthens-latest.json");
    
    if (fs.existsSync(deploymentPath)) {
      const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
      console.log(`   ✅ Contract Address: ${deployment.contractAddress}`);
      console.log(`   ✅ Deployed At: ${new Date(deployment.deployedAt).toLocaleString()}`);
      
      // Try to verify contract exists
      const code = await hre.ethers.provider.getCode(deployment.contractAddress);
      if (code === '0x') {
        issues.push('Contract not found at deployed address');
        console.log(`   ❌ Contract code not found!`);
      } else {
        console.log(`   ✅ Contract code verified on chain`);
      }
    } else {
      issues.push('No deployment found');
      console.log(`   ❌ No deployment file found`);
      console.log(`   💡 Run: npm run deploy:zeta`);
    }
  } catch (error) {
    issues.push('Cannot verify contract deployment');
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Check 4: Frontend Configuration
  console.log("\n4️⃣  Checking Frontend Configuration...");
  try {
    const appJsPath = path.join(__dirname, "app.js");
    const appJsContent = fs.readFileSync(appJsPath, "utf8");
    
    const contractAddressMatch = appJsContent.match(/this\.CONTRACT_ADDRESS = "([^"]+)"/);
    
    if (contractAddressMatch) {
      const configuredAddress = contractAddressMatch[1];
      console.log(`   ✅ Configured Address: ${configuredAddress}`);
      
      if (configuredAddress === "" || configuredAddress.includes("0x...")) {
        issues.push('Contract address not set in app.js');
        console.log(`   ❌ Contract address not properly configured`);
      }
    } else {
      issues.push('Cannot find CONTRACT_ADDRESS in app.js');
      console.log(`   ❌ CONTRACT_ADDRESS not found in app.js`);
    }
  } catch (error) {
    issues.push('Cannot check frontend configuration');
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Check 5: Dependencies
  console.log("\n5️⃣  Checking Dependencies...");
  try {
    const packageJsonPath = path.join(__dirname, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    
    const requiredDeps = ['@openzeppelin/contracts', 'dotenv'];
    let allDepsInstalled = true;
    
    for (const dep of requiredDeps) {
      if (packageJson.dependencies && packageJson.dependencies[dep]) {
        console.log(`   ✅ ${dep} installed`);
      } else {
        allDepsInstalled = false;
        console.log(`   ❌ ${dep} missing`);
      }
    }
    
    if (!allDepsInstalled) {
      warnings.push('Some dependencies missing - run npm install');
    }
  } catch (error) {
    warnings.push('Cannot check dependencies');
    console.log(`   ⚠️  Error: ${error.message}`);
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 DIAGNOSTIC SUMMARY");
  console.log("=".repeat(60));
  
  if (issues.length === 0 && warnings.length === 0) {
    console.log("\n✅ All checks passed! Your setup is ready.");
    console.log("\n🚀 Next steps:");
    console.log("   1. Run: npm start");
    console.log("   2. Open: http://localhost:8000");
    console.log("   3. Connect wallet and test!");
  } else {
    if (issues.length > 0) {
      console.log("\n❌ Issues Found:");
      issues.forEach((issue, i) => {
        console.log(`   ${i + 1}. ${issue}`);
      });
    }
    
    if (warnings.length > 0) {
      console.log("\n⚠️  Warnings:");
      warnings.forEach((warning, i) => {
        console.log(`   ${i + 1}. ${warning}`);
      });
    }
    
    console.log("\n🔧 Recommended Actions:");
    if (issues.some(i => i.includes('balance'))) {
      console.log("   • Get ZETA tokens: https://labs.zetachain.com/get-zeta");
    }
    if (issues.some(i => i.includes('deployment'))) {
      console.log("   • Deploy contract: npm run deploy:zeta");
    }
    if (issues.some(i => i.includes('app.js'))) {
      console.log("   • Update CONTRACT_ADDRESS in app.js with deployed address");
    }
    if (warnings.some(w => w.includes('dependencies'))) {
      console.log("   • Install dependencies: npm install");
    }
  }
  
  console.log("\n" + "=".repeat(60) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
