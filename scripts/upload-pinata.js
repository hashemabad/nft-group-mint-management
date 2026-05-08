import fs from "node:fs";
import path from "node:path";
import axios from "axios";
import FormData from "form-data";
import dotenv from "dotenv";

dotenv.config();

const PINATA_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";
const targetDir = process.argv[2];

if (!targetDir) {
  console.error("Usage: node upload-pinata.js <directory-path>");
  process.exit(1);
}

if (!process.env.PINATA_JWT) {
  console.error("Missing PINATA_JWT in environment.");
  process.exit(1);
}

async function uploadFile(filePath) {
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));

  const response = await axios.post(PINATA_URL, form, {
    maxBodyLength: Infinity,
    headers: {
      ...form.getHeaders(),
      Authorization: process.env.PINATA_JWT
    }
  });

  return response.data.IpfsHash;
}

async function run() {
  const absDir = path.resolve(process.cwd(), targetDir);
  const files = fs.readdirSync(absDir).sort();
  const hashes = [];

  for (const file of files) {
    const fullPath = path.join(absDir, file);
    if (!fs.statSync(fullPath).isFile()) continue;
    const hash = await uploadFile(fullPath);
    hashes.push({ file, hash });
    console.log(`${file} -> ${hash}`);
  }

  fs.writeFileSync(
    path.join(process.cwd(), "pinata-results.json"),
    JSON.stringify(hashes, null, 2)
  );
  console.log("Saved pinata-results.json");
}

run().catch((err) => {
  console.error(err?.response?.data || err.message);
  process.exit(1);
});
