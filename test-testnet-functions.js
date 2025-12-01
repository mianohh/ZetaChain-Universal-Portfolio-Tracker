const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const networkName = hre.network.name;
  console.log(`\n🧪 Testing all functions on ${networkName}...\n`);

  // Load deployment info
  const deploymentPath = path.join(__dirname, "deployments", `${networkName}-latest.json`);
  
  if (!fs.existsSync(deploymentPath)) {
    console.error(`❌ No deployment found for ${networkName}`);
    console.error(`   Run: npx hardhat run deploy-testnet.js --network ${networkName}`);
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const [tester] = await hre.ethers.getSigners();

  console.log(`📍 Contract: ${deployment.contractAddress}`);
  console.log(`👤 Tester: ${tester.address}\n`);

  // Attach to contract
  const OmnichainTracker = await hre.ethers.getContractFactory("OmnichainTracker");
  const tracker = OmnichainTracker.attach(deployment.contractAddress);

  const results = {
    network: networkName,
    timestamp: new Date().toISOString(),
    tests: []
  };

  // Test 1: Check gateway address
  try {
    console.log("🔍 Test 1: Checking gateway address...");
    const gateway = await tracker.gateway();
    console.log(`   ✅ Gateway: ${gateway}`);
    results.tests.push({ name: "Gateway Check", status: "PASSED", value: gateway });
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    results.tests.push({ name: "Gateway Check", status: "FAILED", error: error.message });
  }

  // Test 2: Deposit function
  try {
    console.log("\n💰 Test 2: Testing deposit function...");
    const depositAmount = hre.ethers.parseEther("0.001");
    const tx = await tracker.deposit(depositAmount, { value: depositAmount });
    await tx.wait();
    console.log(`   ✅ Deposit successful: ${hre.ethers.formatEther(depositAmount)} tokens`);
    results.tests.push({ name: "Deposit", status: "PASSED", amount: hre.ethers.formatEther(depositAmount) });
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    results.tests.push({ name: "Deposit", status: "FAILED", error: error.message });
  }

  // Test 3: Get user positions
  try {
    console.log("\n📊 Test 3: Fetching user positions...");
    const positions = await tracker.getUserPositions(tester.address);
    console.log(`   ✅ Found ${positions.length} position(s)`);
    results.tests.push({ name: "Get Positions", status: "PASSED", count: positions.length });
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    results.tests.push({ name: "Get Positions", status: "FAILED", error: error.message });
  }

  // Test 4: Gas estimation
  try {
    console.log("\n⛽ Test 4: Testing gas estimation...");
    const [baseGas, withPremium] = await tracker.estimateWithdrawGas(200000);
    console.log(`   ✅ Base Gas: ${hre.ethers.formatEther(baseGas)}`);
    console.log(`   ✅ With Premium: ${hre.ethers.formatEther(withPremium)}`);
    results.tests.push({ 
      name: "Gas Estimation", 
      status: "PASSED", 
      baseGas: hre.ethers.formatEther(baseGas),
      withPremium: hre.ethers.formatEther(withPremium)
    });
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    results.tests.push({ name: "Gas Estimation", status: "FAILED", error: error.message });
  }

  // Test 5: Check badge eligibility
  try {
    console.log("\n🏆 Test 5: Checking NFT badge eligibility...");
    const isEligible = await tracker.isEligibleForBadge(tester.address);
    const hasBadge = await tracker.getUserBadge(tester.address);
    console.log(`   ✅ Eligible: ${isEligible}`);
    console.log(`   ✅ Badge Token ID: ${hasBadge.toString()}`);
    results.tests.push({ 
      name: "Badge Eligibility", 
      status: "PASSED", 
      eligible: isEligible,
      tokenId: hasBadge.toString()
    });
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    results.tests.push({ name: "Badge Eligibility", status: "FAILED", error: error.message });
  }

  // Test 6: Withdrawal (if position exists)
  try {
    const positions = await tracker.getUserPositions(tester.address);
    if (positions.length > 0 && positions[0].status === 0) {
      console.log("\n🔄 Test 6: Testing withdrawal function...");
      const [, gasFee] = await tracker.estimateWithdrawGas(200000);
      const tx = await tracker.withdrawAndTrack(
        0,
        1, // Ethereum
        tester.address,
        200000,
        { value: gasFee }
      );
      await tx.wait();
      console.log(`   ✅ Withdrawal initiated successfully`);
      results.tests.push({ name: "Withdrawal", status: "PASSED" });
    } else {
      console.log("\n⏭️  Test 6: Skipping withdrawal (no active positions)");
      results.tests.push({ name: "Withdrawal", status: "SKIPPED", reason: "No active positions" });
    }
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    results.tests.push({ name: "Withdrawal", status: "FAILED", error: error.message });
  }

  // Test 7: Mint badge (if eligible)
  try {
    const isEligible = await tracker.isEligibleForBadge(tester.address);
    if (isEligible) {
      console.log("\n🎨 Test 7: Testing badge minting...");
      const tx = await tracker.mintSafetyBadge();
      await tx.wait();
      console.log(`   ✅ Badge minted successfully`);
      results.tests.push({ name: "Mint Badge", status: "PASSED" });
    } else {
      console.log("\n⏭️  Test 7: Skipping badge mint (not eligible)");
      results.tests.push({ name: "Mint Badge", status: "SKIPPED", reason: "Not eligible" });
    }
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    results.tests.push({ name: "Mint Badge", status: "FAILED", error: error.message });
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("  TEST SUMMARY");
  console.log("=".repeat(60));
  
  const passed = results.tests.filter(t => t.status === "PASSED").length;
  const failed = results.tests.filter(t => t.status === "FAILED").length;
  const skipped = results.tests.filter(t => t.status === "SKIPPED").length;
  
  console.log(`\n  ✅ Passed: ${passed}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  ⏭️  Skipped: ${skipped}`);
  console.log(`  📊 Total: ${results.tests.length}\n`);

  // Save results
  const resultsDir = path.join(__dirname, "test-results");
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir);
  }

  const filename = `${networkName}-${Date.now()}.json`;
  fs.writeFileSync(
    path.join(resultsDir, filename),
    JSON.stringify(results, null, 2)
  );

  console.log(`📝 Test results saved to: test-results/${filename}\n`);

  if (failed > 0) {
    console.log("⚠️  Some tests failed. Check the results above.\n");
    process.exit(1);
  } else {
    console.log("🎉 All tests passed successfully!\n");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
