import { expect } from "chai";
import { ethers } from "hardhat";
import { MerkleTree } from "merkletreejs";

function allowlistLeaf(address: string, allowance: bigint) {
  return ethers.solidityPackedKeccak256(["address", "uint256"], [address, allowance]);
}

function hashBuffer(data: Buffer | string) {
  const bytes = Buffer.isBuffer(data)
    ? `0x${data.toString("hex")}`
    : data.startsWith("0x")
      ? data
      : `0x${Buffer.from(data).toString("hex")}`;
  return Buffer.from(ethers.keccak256(bytes).slice(2), "hex");
}

describe("OilGods launch flow", function () {
  it("handles allowlist, public mint, and reveal", async function () {
    const [owner, user1, user2] = await ethers.getSigners();

    const allow1 = 2n;
    const allow2 = 1n;
    const leaves = [
      Buffer.from(allowlistLeaf(user1.address, allow1).slice(2), "hex"),
      Buffer.from(allowlistLeaf(user2.address, allow2).slice(2), "hex")
    ];
    const tree = new MerkleTree(leaves, hashBuffer, { sortPairs: true });
    const root = tree.getHexRoot();
    const proof1 = tree.getHexProof(leaves[0]);

    const Factory = await ethers.getContractFactory("OilGods");
    const contract = await Factory.deploy(
      "ipfs://metadata/",
      "ipfs://hidden/hidden.json",
      ethers.parseEther("0.002"),
      ethers.parseEther("0.0015"),
      owner.address,
      700
    );
    await contract.waitForDeployment();

    await (await contract.setMintControls(5, 10, 5, 0)).wait();
    await (await contract.setMerkleRoot(root)).wait();
    await (await contract.setAllowlistMintState(true)).wait();

    const allowMintTx = await contract
      .connect(user1)
      .mintAllowlist(2, allow1, proof1, { value: ethers.parseEther("0.003") });
    await allowMintTx.wait();

    let reverted = false;
    try {
      const overMintTx = await contract
        .connect(user1)
        .mintAllowlist(1, allow1, proof1, { value: ethers.parseEther("0.0015") });
      await overMintTx.wait();
    } catch (error) {
      reverted = true;
      const msg = error instanceof Error ? error.message : String(error);
      expect(msg).to.contain("Exceeds allowlist allocation");
    }
    expect(reverted).to.equal(true);

    await (await contract.setAllowlistMintState(false)).wait();
    await (await contract.setMintState(true)).wait();

    const publicMintTx = await contract.connect(user2).mint(2, { value: ethers.parseEther("0.004") });
    await publicMintTx.wait();

    expect(await contract.totalSupply()).to.equal(4n);
    expect(await contract.tokenURI(0)).to.equal("ipfs://hidden/hidden.json");

    await (await contract.reveal()).wait();
    expect(await contract.tokenURI(0)).to.equal("ipfs://metadata/0.json");
  });
});
