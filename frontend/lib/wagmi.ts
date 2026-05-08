import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { base, baseSepolia, hardhat } from "wagmi/chains";

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 84532);

const targetChain =
  chainId === 8453 ? base : chainId === 31337 ? hardhat : baseSepolia;

const rpcUrl =
  process.env.NEXT_PUBLIC_RPC_URL ||
  targetChain.rpcUrls.default.http[0] ||
  "http://127.0.0.1:8545";

export const wagmiConfig = getDefaultConfig({
  appName: "NFT Group Mint & Management",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "replace-me",
  chains: [targetChain],
  transports: {
    [targetChain.id]: http(rpcUrl)
  },
  ssr: true
});
