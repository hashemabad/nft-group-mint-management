"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useMemo, useState } from "react";
import { formatEther } from "viem";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { oilGodsAbi } from "@/abi/OilGods";

const contractAddress = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;
const fallbackMintPriceWei = BigInt(process.env.NEXT_PUBLIC_MINT_PRICE_WEI || "2000000000000000");
const fallbackAllowlistMintPriceWei = BigInt(
  process.env.NEXT_PUBLIC_ALLOWLIST_MINT_PRICE_WEI || "1500000000000000"
);
const defaultProofText = process.env.NEXT_PUBLIC_ALLOWLIST_PROOF || "[]";

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const [qty, setQty] = useState(1);
  const [mode, setMode] = useState<"public" | "allowlist">("public");
  const [proofText, setProofText] = useState(defaultProofText);
  const [allowance, setAllowance] = useState(0);
  const [status, setStatus] = useState("");

  const { data: totalSupply } = useReadContract({
    abi: oilGodsAbi,
    address: contractAddress,
    functionName: "totalSupply"
  });

  const { data: maxSupply } = useReadContract({
    abi: oilGodsAbi,
    address: contractAddress,
    functionName: "maxSupply"
  });

  const { data: mintPriceFromChain } = useReadContract({
    abi: oilGodsAbi,
    address: contractAddress,
    functionName: "mintPrice"
  });

  const { data: allowlistMintPriceFromChain } = useReadContract({
    abi: oilGodsAbi,
    address: contractAddress,
    functionName: "allowlistMintPrice"
  });

  const { data: publicMintOpen } = useReadContract({
    abi: oilGodsAbi,
    address: contractAddress,
    functionName: "publicMintOpen"
  });

  const { data: allowlistMintOpen } = useReadContract({
    abi: oilGodsAbi,
    address: contractAddress,
    functionName: "allowlistMintOpen"
  });

  const activeMintPrice =
    mode === "public"
      ? mintPriceFromChain ?? fallbackMintPriceWei
      : allowlistMintPriceFromChain ?? fallbackAllowlistMintPriceWei;

  const totalPrice = useMemo(() => activeMintPrice * BigInt(qty), [activeMintPrice, qty]);

  useEffect(() => {
    async function loadProof() {
      if (!address) return;
      try {
        const res = await fetch(`/api/allowlist-proof?address=${address}`);
        if (!res.ok) return;
        const data = (await res.json()) as { proof: `0x${string}`[]; allowance: number };
        setProofText(JSON.stringify(data.proof));
        setAllowance(data.allowance);
      } catch {
        // Keep manual fallback when API source is not configured yet.
      }
    }
    void loadProof();
  }, [address]);

  async function onMint() {
    try {
      setStatus("Submitting transaction...");
      let tx: `0x${string}`;

      if (mode === "allowlist") {
        const parsed = JSON.parse(proofText) as `0x${string}`[];
        if (!Array.isArray(parsed)) {
          throw new Error("Allowlist proof must be a JSON array");
        }
        if (allowance <= 0) {
          throw new Error("Allowlist allowance is missing");
        }
        tx = await writeContractAsync({
          abi: oilGodsAbi,
          address: contractAddress,
          functionName: "mintAllowlist",
          args: [BigInt(qty), BigInt(allowance), parsed],
          value: totalPrice
        });
      } else {
        tx = await writeContractAsync({
          abi: oilGodsAbi,
          address: contractAddress,
          functionName: "mint",
          args: [BigInt(qty)],
          value: totalPrice
        });
      }

      setStatus(`Mint submitted: ${tx}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Mint failed");
    }
  }

  return (
    <main>
      <h1>NFT Group Mint & Management</h1>
      <p>6666 supply on Base. Build and manage your NFT mint flow.</p>

      <div className="card">
        <div className="row">
          <span>Wallet</span>
          <ConnectButton />
        </div>
        <div className="row">
          <span>Mode</span>
          <div>
            <button type="button" onClick={() => setMode("public")}>
              Public
            </button>{" "}
            <button type="button" onClick={() => setMode("allowlist")}>
              Allowlist
            </button>
          </div>
        </div>
        <div className="row">
          <span>Price ({mode})</span>
          <strong>{formatEther(activeMintPrice)} ETH</strong>
        </div>
        <div className="row">
          <span>Quantity</span>
          <input
            type="number"
            min={1}
            max={20}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value || 1)))}
          />
        </div>
        <div className="row">
          <span>Supply</span>
          <strong>
            {totalSupply?.toString() || "0"} / {maxSupply?.toString() || "6666"}
          </strong>
        </div>
        <div className="row">
          <span>Mint State</span>
          <strong>
            Public: {publicMintOpen ? "Open" : "Closed"} | Allowlist:{" "}
            {allowlistMintOpen ? "Open" : "Closed"}
          </strong>
        </div>
        {mode === "allowlist" && (
          <div className="row">
            <span>Allowlist Config</span>
            <div style={{ width: "360px" }}>
              <div style={{ marginBottom: "8px" }}>Allowance: {allowance}</div>
              <textarea
                value={proofText}
                onChange={(e) => setProofText(e.target.value)}
                rows={3}
                style={{ width: "100%" }}
              />
            </div>
          </div>
        )}
        <div className="row">
          <span>Total</span>
          <strong>{formatEther(totalPrice)} ETH</strong>
        </div>
        <button disabled={!isConnected || isPending} onClick={onMint}>
          {isPending ? "Minting..." : "Mint NFT Collection"}
        </button>
        {status && <p>{status}</p>}
      </div>
    </main>
  );
}
