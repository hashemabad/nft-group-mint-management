// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract OilGods is ERC721A, Ownable, ERC2981, ReentrancyGuard {
    string private baseTokenURI;
    string public hiddenTokenURI;
    uint256 public mintPrice;
    uint256 public allowlistMintPrice;
    uint256 public immutable maxSupply = 6666;
    bool public publicMintOpen;
    bool public allowlistMintOpen;
    bool public revealed;
    bytes32 public merkleRoot;
    uint256 public maxPerTx = 5;
    uint256 public maxPerWalletPublic = 10;
    uint256 public maxPerWalletAllowlist = 3;
    uint256 public mintCooldownSeconds = 20;
    mapping(address => uint256) public publicMintedByWallet;
    mapping(address => uint256) public allowlistMintedByWallet;
    mapping(address => uint256) public lastMintAt;

    constructor(
        string memory baseURI_,
        string memory hiddenURI_,
        uint256 mintPrice_,
        uint256 allowlistMintPrice_,
        address royaltyReceiver,
        uint96 royaltyBps
    ) ERC721A("NFT Group Mint & Management", "NGMM") Ownable(msg.sender) {
        baseTokenURI = baseURI_;
        hiddenTokenURI = hiddenURI_;
        mintPrice = mintPrice_;
        allowlistMintPrice = allowlistMintPrice_;
        publicMintOpen = false;
        allowlistMintOpen = false;
        revealed = false;
        _setDefaultRoyalty(royaltyReceiver, royaltyBps);
    }

    function mint(uint256 quantity) external payable nonReentrant {
        _mintPublic(quantity);
    }

    function mintAllowlist(
        uint256 quantity,
        uint256 allowance,
        bytes32[] calldata merkleProof
    ) external payable nonReentrant {
        require(allowlistMintOpen, "Allowlist mint is closed");
        require(quantity > 0, "Quantity must be > 0");
        require(quantity <= maxPerTx, "Exceeds max per tx");
        require(block.timestamp >= lastMintAt[msg.sender] + mintCooldownSeconds, "Mint cooldown active");
        require(totalSupply() + quantity <= maxSupply, "Max supply reached");
        require(allowance > 0, "Allowance must be > 0");
        require(
            allowlistMintedByWallet[msg.sender] + quantity <= allowance,
            "Exceeds allowlist allocation"
        );
        require(
            allowlistMintedByWallet[msg.sender] + quantity <= maxPerWalletAllowlist,
            "Exceeds allowlist global cap"
        );
        require(msg.value >= allowlistMintPrice * quantity, "Not enough ETH");

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, allowance));
        require(MerkleProof.verify(merkleProof, merkleRoot, leaf), "Invalid merkle proof");

        allowlistMintedByWallet[msg.sender] += quantity;
        lastMintAt[msg.sender] = block.timestamp;
        _mint(msg.sender, quantity);
    }

    function setMintState(bool isOpen) external onlyOwner {
        publicMintOpen = isOpen;
    }

    function setAllowlistMintState(bool isOpen) external onlyOwner {
        allowlistMintOpen = isOpen;
    }

    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
    }

    function setAllowlistMintPrice(uint256 newPrice) external onlyOwner {
        allowlistMintPrice = newPrice;
    }

    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        baseTokenURI = newBaseURI;
    }

    function setHiddenURI(string calldata newHiddenURI) external onlyOwner {
        hiddenTokenURI = newHiddenURI;
    }

    function setMerkleRoot(bytes32 newMerkleRoot) external onlyOwner {
        merkleRoot = newMerkleRoot;
    }

    function reveal() external onlyOwner {
        revealed = true;
    }

    function setRoyalty(address receiver, uint96 feeNumerator) external onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    function setMintControls(
        uint256 newMaxPerTx,
        uint256 newMaxPerWalletPublic,
        uint256 newMaxPerWalletAllowlist,
        uint256 newMintCooldownSeconds
    ) external onlyOwner {
        require(newMaxPerTx > 0, "maxPerTx must be > 0");
        maxPerTx = newMaxPerTx;
        maxPerWalletPublic = newMaxPerWalletPublic;
        maxPerWalletAllowlist = newMaxPerWalletAllowlist;
        mintCooldownSeconds = newMintCooldownSeconds;
    }

    function withdraw(address payable receiver) external onlyOwner nonReentrant {
        require(receiver != address(0), "Invalid receiver");
        (bool success, ) = receiver.call{value: address(this).balance}("");
        require(success, "Withdraw failed");
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "URI query for nonexistent token");
        if (!revealed) {
            return hiddenTokenURI;
        }
        return string.concat(_baseURI(), _toString(tokenId), ".json");
    }

    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721A, ERC2981) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _mintPublic(uint256 quantity) internal {
        require(publicMintOpen, "Mint is closed");
        require(quantity > 0, "Quantity must be > 0");
        require(quantity <= maxPerTx, "Exceeds max per tx");
        require(block.timestamp >= lastMintAt[msg.sender] + mintCooldownSeconds, "Mint cooldown active");
        require(totalSupply() + quantity <= maxSupply, "Max supply reached");
        require(publicMintedByWallet[msg.sender] + quantity <= maxPerWalletPublic, "Exceeds wallet limit");
        require(msg.value >= mintPrice * quantity, "Not enough ETH");

        publicMintedByWallet[msg.sender] += quantity;
        lastMintAt[msg.sender] = block.timestamp;
        _mint(msg.sender, quantity);
    }
}
