import { ethers } from "hardhat";

/**
 * Deploy OilGods on Hardhat localhost and open public mint with relaxed controls for local testing.
 */
async function main() {
  const baseURI = process.env.BASE_URI || "http://127.0.0.1:9999/metadata/";
  const hiddenURI = process.env.HIDDEN_URI || "http://127.0.0.1:9999/hidden.json";
  const mintPrice = process.env.MINT_PRICE_WEI || "1000000000000000";
  const allowlistMintPrice = process.env.ALLOWLIST_MINT_PRICE_WEI || "1000000000000000";
  const [deployer] = await ethers.getSigners();
  const envRoy = (process.env.ROYALTY_RECEIVER || "").trim();
  const royaltyReceiver =
    envRoy.startsWith("0x") &&
    envRoy.length === 42 &&
    envRoy !== ethers.ZeroAddress
      ? envRoy
      : deployer.address;
  const royaltyBps = process.env.ROYALTY_BPS || "700";

  const Factory = await ethers.getContractFactory("OilGods");
  const contract = await Factory.deploy(
    baseURI,
    hiddenURI,
    mintPrice,
    allowlistMintPrice,
    royaltyReceiver,
    royaltyBps
  );
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  await (await contract.setMintControls(20, 6666, 6666, 0)).wait();
  await (await contract.setMintState(true)).wait();

  console.log("OilGods deployed at:", address);
  console.log("Public mint: OPEN (localhost)");
  console.log("Mint Price (wei):", mintPrice);
  console.log("");
  console.log("Frontend .env.local (Hardhat):");
  console.log(`NEXT_PUBLIC_CHAIN_ID=31337`);
  console.log(`NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545`);
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
  console.log(`NEXT_PUBLIC_MINT_PRICE_WEI=${mintPrice}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
