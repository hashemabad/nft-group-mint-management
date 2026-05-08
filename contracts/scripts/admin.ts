import { ethers } from "hardhat";

function usage() {
  console.log("Usage:");
  console.log("  npx hardhat run scripts/admin.ts --network baseSepolia -- action=open-public");
  console.log("  npx hardhat run scripts/admin.ts --network baseSepolia -- action=close-public");
  console.log("  npx hardhat run scripts/admin.ts --network baseSepolia -- action=open-allowlist");
  console.log("  npx hardhat run scripts/admin.ts --network baseSepolia -- action=close-allowlist");
  console.log("  npx hardhat run scripts/admin.ts --network baseSepolia -- action=reveal");
  console.log("  npx hardhat run scripts/admin.ts --network baseSepolia -- action=set-root root=0x...");
}

function parseArgs() {
  const args = process.argv.slice(2);
  const map: Record<string, string> = {};
  for (const entry of args) {
    const [key, value] = entry.split("=");
    if (key && value) map[key] = value;
  }
  return map;
}

async function main() {
  const args = parseArgs();
  const action = args.action;
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!action || !contractAddress) {
    usage();
    throw new Error("Missing action or CONTRACT_ADDRESS in env");
  }

  const contract = await ethers.getContractAt("OilGods", contractAddress);

  if (action === "open-public") {
    const tx = await contract.setMintState(true);
    await tx.wait();
    console.log("Public mint opened:", tx.hash);
    return;
  }

  if (action === "close-public") {
    const tx = await contract.setMintState(false);
    await tx.wait();
    console.log("Public mint closed:", tx.hash);
    return;
  }

  if (action === "open-allowlist") {
    const tx = await contract.setAllowlistMintState(true);
    await tx.wait();
    console.log("Allowlist mint opened:", tx.hash);
    return;
  }

  if (action === "close-allowlist") {
    const tx = await contract.setAllowlistMintState(false);
    await tx.wait();
    console.log("Allowlist mint closed:", tx.hash);
    return;
  }

  if (action === "reveal") {
    const tx = await contract.reveal();
    await tx.wait();
    console.log("Collection revealed:", tx.hash);
    return;
  }

  if (action === "set-root") {
    const root = args.root;
    if (!root) throw new Error("Missing root argument");
    const tx = await contract.setMerkleRoot(root);
    await tx.wait();
    console.log("Merkle root updated:", tx.hash, root);
    return;
  }

  usage();
  throw new Error(`Unknown action: ${action}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
