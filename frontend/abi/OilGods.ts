export const oilGodsAbi = [
  {
    inputs: [
      { internalType: "string", name: "_baseURI", type: "string" },
      { internalType: "string", name: "_hiddenURI", type: "string" },
      { internalType: "uint256", name: "_mintPrice", type: "uint256" },
      { internalType: "uint256", name: "_allowlistMintPrice", type: "uint256" },
      { internalType: "address", name: "royaltyReceiver", type: "address" },
      { internalType: "uint96", name: "royaltyBps", type: "uint96" }
    ],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    inputs: [{ internalType: "uint256", name: "quantity", type: "uint256" }],
    name: "mint",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "quantity", type: "uint256" },
      { internalType: "uint256", name: "allowance", type: "uint256" },
      { internalType: "bytes32[]", name: "merkleProof", type: "bytes32[]" }
    ],
    name: "mintAllowlist",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "maxSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "mintPrice",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "allowlistMintPrice",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "publicMintOpen",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "allowlistMintOpen",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  }
] as const;
