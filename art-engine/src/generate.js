import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";

const TOTAL = Number(process.env.TOTAL_NFTS || 6666);
const SIZE = 1000;
const ROOT = process.cwd();
const ASSETS_DIR = path.resolve(ROOT, "..", "assets");
const OUTPUT_IMAGES_DIR = path.join(ROOT, "output", "images");
const OUTPUT_METADATA_DIR = path.join(ROOT, "output", "metadata");

const LAYERS = [
  { trait: "Background", dir: "background" },
  { trait: "Body", dir: "body" },
  { trait: "Eyes", dir: "eyes" },
  { trait: "Mask", dir: "mask" },
  { trait: "Oil Effect", dir: "oil_effect" },
  { trait: "Crown", dir: "crown" }
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function cleanName(filename) {
  return filename.replace(path.extname(filename), "");
}

function getOptions(layerDir) {
  const absDir = path.join(ASSETS_DIR, layerDir);
  if (!fs.existsSync(absDir)) return [];
  return fs
    .readdirSync(absDir)
    .filter((f) => /\.(png|jpg|jpeg)$/i.test(f))
    .sort();
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function dnaForSelection(selection) {
  return crypto.createHash("sha1").update(selection.join("|")).digest("hex");
}

async function drawComposite(selection) {
  const overlays = [];
  for (const selectedFile of selection) {
    if (!selectedFile) continue;
    const [layerDir, filename] = selectedFile.split("::");
    const abs = path.join(ASSETS_DIR, layerDir, filename);
    const input = await sharp(abs).resize(SIZE, SIZE).png().toBuffer();
    overlays.push({ input, left: 0, top: 0 });
  }

  return sharp({
    create: {
      width: SIZE,
      height: SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite(overlays)
    .png()
    .toBuffer();
}

function buildMetadata(id, cidPlaceholder, attrs) {
  return {
    name: `Group Mint NFT #${id}`,
    description: "NFT collection for group minting and smart management flows",
    image: `ipfs://${cidPlaceholder}/${id}.png`,
    attributes: attrs
  };
}

async function main() {
  ensureDir(OUTPUT_IMAGES_DIR);
  ensureDir(OUTPUT_METADATA_DIR);

  const optionsByLayer = LAYERS.map((layer) => ({
    ...layer,
    options: getOptions(layer.dir)
  }));
  const totalCombinations = optionsByLayer.reduce((acc, layer) => {
    const count = layer.options.length || 1;
    return acc * count;
  }, 1);

  if (totalCombinations < TOTAL) {
    throw new Error(
      `Not enough combinations. Need ${TOTAL}, but current layers produce ${totalCombinations}.`
    );
  }

  const dnaSet = new Set();
  let minted = 0;
  let guard = 0;

  while (minted < TOTAL) {
    guard += 1;
    if (guard > TOTAL * 50) {
      throw new Error("Exceeded generation attempts. Check layer distribution and rarity.");
    }

    const selection = optionsByLayer.map((layer) => {
      if (!layer.options.length) return null;
      const picked = pickRandom(layer.options);
      return `${layer.dir}::${picked}`;
    });

    const dna = dnaForSelection(selection.filter(Boolean));
    if (dnaSet.has(dna)) continue;
    dnaSet.add(dna);

    const id = minted + 1;
    const imageBuffer = await drawComposite(selection);
    fs.writeFileSync(path.join(OUTPUT_IMAGES_DIR, `${id}.png`), imageBuffer);

    const attributes = selection
      .map((entry, idx) => {
        if (!entry) return null;
        const [, filename] = entry.split("::");
        return {
          trait_type: optionsByLayer[idx].trait,
          value: cleanName(filename)
        };
      })
      .filter(Boolean);

    const metadata = buildMetadata(id, "REPLACE_IMAGE_CID", attributes);
    fs.writeFileSync(
      path.join(OUTPUT_METADATA_DIR, `${id}.json`),
      JSON.stringify(metadata, null, 2)
    );

    minted += 1;
    if (minted % 500 === 0) {
      console.log(`Generated ${minted}/${TOTAL}`);
    }
  }

  console.log(`Done. Generated ${minted} NFTs.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
