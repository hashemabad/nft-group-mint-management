# NFT Group Mint & Management (Base + ERC721A)

یک استارتر حرفه‌ای برای راه‌اندازی، مینت و مدیریت پروژه NFT با سقف `6666` روی شبکه Base.
این ریپو کل مسیر لانچ را پوشش می‌دهد: قرارداد، فرانت، تولید متادیتا، آپلود IPFS و عملیات روز لانچ.

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Blockchain](https://img.shields.io/badge/Blockchain-Base-blue)
![Stack](https://img.shields.io/badge/Stack-Hardhat%20%7C%20Next.js%20%7C%20ERC721A-8A2BE2)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)

## Community Standards

- Contribution guide: `CONTRIBUTING.md`
- Security policy: `SECURITY.md`
- Code of conduct: `CODE_OF_CONDUCT.md`
- License: `LICENSE` (MIT)

## Quick Start

```bash
# contracts
cd contracts && npm install && npx hardhat compile

# frontend
cd ../frontend && npm install && cp .env.example .env.local && npm run dev
```

## Why This Repository

- لانچ کامل NFT از قرارداد تا فرانت و متادیتا را پوشش می‌دهد.
- برای سناریوی واقعی مینت (`allowlist -> public -> reveal`) آماده شده است.
- روی امنیت لانچ، کنترل بات و آماده‌سازی روز انتشار تمرکز دارد.

## SEO Keywords

`NFT minting`, `NFT launch`, `Base chain`, `ERC721A`, `Hardhat`, `Next.js`, `wagmi`, `allowlist`, `Merkle proof`, `royalty`, `IPFS metadata`, `web3 project starter`

## Project Description

This repository is a practical starter for launching, minting, and managing an NFT project with a `6666` max supply on Base.

## توسعه‌دهنده پروژه

- **نام کامل:** Mohammad Nasser Haji Hashemabad
- **نام کاربری:** hashemabad
- **Bio:** Building innovative blockchain & AI solutions | Passionate open-source contributor | Building smart, scalable tools
- **ایمیل:** [info@mohammadnasser.com](mailto:info@mohammadnasser.com)
- **وب‌سایت:** [mohammadnasser.com](https://mohammadnasser.com)
- **LinkedIn:** [in/hashemabad](https://linkedin.com/in/hashemabad)
- **Instagram:** [@nasserhashemabadi](https://instagram.com/nasserhashemabadi)
- **Twitter/X:** [@hajihashemabad](https://x.com/hajihashemabad)

## ساختار

- `contracts/`: قرارداد ERC721A + Hardhat deploy
- `art-engine/`: ساخت خروجی تصویر و متادیتا
- `metadata/`: خروجی نهایی JSON (در زمان اجرا پر می‌شود)
- `scripts/`: اسکریپت آپلود IPFS (Pinata)
- `frontend/`: سایت مینت (Next.js + wagmi)
- `assets/`: لایه‌های طراحی

## قابلیت‌های لانچ نسخه فعلی قرارداد

- Public mint + allowlist mint (Merkle proof)
- Anti-bot controls: `maxPerTx`, wallet caps, cooldown
- Reveal flow با `hiddenTokenURI`
- EIP-2981 royalty قابل تنظیم
- Owner controls برای قیمت، وضعیت مینت، root، reveal

## 1) راه‌اندازی قرارداد

```bash
cd contracts
npm install
npx hardhat compile
```

فایل `.env` در `contracts/`:

```bash
PRIVATE_KEY=0x...
BASE_RPC_URL=https://mainnet.base.org
BASESCAN_API_KEY=...
BASE_URI=ipfs://YOUR_METADATA_CID/
HIDDEN_URI=ipfs://YOUR_HIDDEN_METADATA/hidden.json
ALLOWLIST_MINT_PRICE_WEI=1500000000000000
ROYALTY_RECEIVER=0x...
ROYALTY_BPS=700
```

دیپلوی:

```bash
npx hardhat run scripts/deploy.ts --network base
```

Allowlist root:

```bash
cd scripts
npm install
cp allowlist.example.json allowlist.json
npm run merkle:root
```

در `allowlist.json` برای هر آدرس باید `allowance` مشخص کنی.  
خروجی `merkleRoot` را با تابع `setMerkleRoot` روی قرارداد ست کن.

برای فرانت، فایل `scripts/allowlist-proofs-frontend.json` را در
`frontend/data/allowlist-proofs.json` کپی کن تا API داخلی proof را برگرداند.

کنترل لانچ قرارداد (admin):

```bash
cd contracts
npm run admin:base-sepolia action=set-root root=0xYOUR_MERKLE_ROOT
npm run admin:base-sepolia action=open-allowlist
npm run admin:base-sepolia action=close-allowlist
npm run admin:base-sepolia action=open-public
npm run admin:base-sepolia action=reveal
```

## 2) راه‌اندازی Art Engine

```bash
cd art-engine
npm install
npm run generate
```

خروجی تصاویر در `art-engine/output/images` و خروجی متادیتا در `art-engine/output/metadata` ذخیره می‌شود.

## 3) آپلود روی Pinata

```bash
cd scripts
npm install
cp .env.example .env
npm run upload:images
npm run upload:metadata
```

## 4) راه‌اندازی Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

مقدارهای زیر را در `.env.local` ست کن:

- `NEXT_PUBLIC_CHAIN_ID=8453` (Base mainnet) یا `84532` (Base Sepolia)
- `NEXT_PUBLIC_CONTRACT_ADDRESS=0x...`
- `NEXT_PUBLIC_RPC_URL=https://mainnet.base.org`
- `NEXT_PUBLIC_MINT_PRICE_WEI=2000000000000000`
- `NEXT_PUBLIC_ALLOWLIST_MINT_PRICE_WEI=1500000000000000`
- `NEXT_PUBLIC_ALLOWLIST_PROOF=["0x...","0x..."]`

فرانت endpoint زیر را برای proof می‌خواند:

- `GET /api/allowlist-proof?address=0x...`

## 5) تست smoke فلو لانچ

```bash
cd contracts
npm install
npm run test
```

این تست فلو `allowlist -> public -> reveal` را بررسی می‌کند.

### Hardhat لوکال (تست قرارداد + فرانت)

ترمینال ۱ در `contracts/`:

```bash
npx hardhat node
# یا: npm run node:local
```

ترمینال ۲ در `contracts/`:

```bash
npx hardhat run scripts/deploy-local.ts --network localhost
# یا: npm run deploy:localhost
```

خروجی آدرس قرارداد را در `frontend/.env.local` ست کن (`NEXT_PUBLIC_CHAIN_ID=31337`, `NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545`).

ترمینال ۳ در `frontend/`:

```bash
npm run dev
```

در MetaMask شبکهٔ **localhost** با RPC `http://127.0.0.1:8545` و Chain ID **31337** را اضافه کن و یک حساب پیش‌فرض هاردَت را با private key آن وارد کن (در خروجی `hardhat node` چاپ می‌شود؛ فقط لوکال).

## لانچ واقعی

- قبل از مینت، حداقل یک dry-run کامل روی Base Sepolia انجام بده.
- برای جلوگیری از بات‌ها، فاز whitelist یا allowlist اضافه کن.
- قبل از باز کردن public mint، اول allowlist mint را در بازه محدود باز کن.
- در روز لانچ، یک runbook داشته باش (RPC backup, explorer links, incident plan).
