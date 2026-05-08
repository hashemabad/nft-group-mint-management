import { ethers } from "hardhat";

async function main() {
  const baseURI = process.env.BASE_URI || "ipfs://REPLACE_WITH_METADATA_CID/";
  const hiddenURI = process.env.HIDDEN_URI || "ipfs://REPLACE_WITH_HIDDEN_METADATA/hidden.json";
  const mintPrice = process.env.MINT_PRICE_WEI || "2000000000000000";
  const allowlistMintPrice = process.env.ALLOWLIST_MINT_PRICE_WEI || "1500000000000000";
  const royaltyReceiver = process.env.ROYALTY_RECEIVER || "0x0000000000000000000000000000000000000000";
  const royaltyBps = process.env.ROYALTY_BPS || "700";

  const OilGods = await ethers.getContractFactory("OilGods");
  const contract = await OilGods.deploy(
    baseURI,
    hiddenURI,
    mintPrice,
    allowlistMintPrice,
    royaltyReceiver,
    royaltyBps
  );
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("OilGods deployed at:", address);
  console.log("Base URI:", baseURI);
  console.log("Hidden URI:", hiddenURI);
  console.log("Mint Price (wei):", mintPrice);
  console.log("Allowlist Mint Price (wei):", allowlistMintPrice);
  console.log("Royalty receiver:", royaltyReceiver);
  console.log("Royalty bps:", royaltyBps);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
