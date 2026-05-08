import fs from "node:fs";
import path from "node:path";
import { keccak256, solidityPacked } from "ethers";
import { MerkleTree } from "merkletreejs";

const input = process.argv[2];

if (!input) {
  console.error("Usage: node merkle-root.js <allowlist.json>");
  process.exit(1);
}

const absPath = path.resolve(process.cwd(), input);
const entries = JSON.parse(fs.readFileSync(absPath, "utf-8"));

if (!Array.isArray(entries) || entries.length === 0) {
  console.error("Allowlist file must be a non-empty JSON array.");
  process.exit(1);
}

const normalized = entries.map((item) => ({
  address: String(item.address || "").toLowerCase(),
  allowance: Number(item.allowance || 0)
}));

for (const item of normalized) {
  if (!/^0x[a-f0-9]{40}$/.test(item.address)) {
    console.error(`Invalid address: ${item.address}`);
    process.exit(1);
  }
  if (!Number.isInteger(item.allowance) || item.allowance <= 0) {
    console.error(`Invalid allowance for ${item.address}`);
    process.exit(1);
  }
}

const hashBuffer = (data) => {
  const bytes =
    Buffer.isBuffer(data)
      ? `0x${data.toString("hex")}`
      : data.startsWith("0x")
        ? data
        : `0x${Buffer.from(data).toString("hex")}`;
  return Buffer.from(keccak256(bytes).slice(2), "hex");
};

const leaves = normalized.map((item) =>
  Buffer.from(
    keccak256(solidityPacked(["address", "uint256"], [item.address, BigInt(item.allowance)])).slice(2),
    "hex"
  )
);
const tree = new MerkleTree(leaves, hashBuffer, { sortPairs: true });
const root = tree.getHexRoot();

const listOutput = normalized.map((item, i) => ({
  address: item.address,
  allowance: item.allowance,
  proof: tree.getHexProof(leaves[i])
}));

const frontendMap = listOutput.reduce((acc, item) => {
  acc[item.address] = { allowance: item.allowance, proof: item.proof };
  return acc;
}, {});

fs.writeFileSync(
  path.join(process.cwd(), "allowlist-proofs.json"),
  JSON.stringify({ merkleRoot: root, entries: listOutput }, null, 2)
);
fs.writeFileSync(
  path.join(process.cwd(), "allowlist-proofs-frontend.json"),
  JSON.stringify(frontendMap, null, 2)
);

console.log("Merkle Root:", root);
console.log("Saved proofs to allowlist-proofs.json");
console.log("Saved frontend map to allowlist-proofs-frontend.json");
