// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CarbonMarketplace is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    struct PaperMetadata {
        string authorName;
        string paperName;
        uint256 price;
        string ipfsHash;
    }

    mapping(uint256 => PaperMetadata) public papers;
    mapping(address => uint256[]) public publisherPapers;
    mapping(uint256 => address) public paperOwners;

    event PaperPublished(address indexed publisher, uint256 indexed tokenId);
    event PaperPurchased(address indexed buyer, uint256 indexed tokenId, address indexed publisher);

    constructor() ERC721("Carbon Research Papers", "CRSP") {}

    function publishPaper(
        string memory authorName,
        string memory paperName,
        uint256 price,
        string memory ipfsHash
    ) public {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        papers[tokenId] = PaperMetadata(authorName, paperName, price, ipfsHash);
        publisherPapers[msg.sender].push(tokenId);
        paperOwners[tokenId] = msg.sender;

        _safeMint(msg.sender, tokenId);
        emit PaperPublished(msg.sender, tokenId);
    }

    function buyPaper(uint256 tokenId) public payable {
        require(papers[tokenId].price <= msg.value, "Insufficient funds");
        require(paperOwners[tokenId] != msg.sender, "You already own this paper");

        address publisher = paperOwners[tokenId];
        uint256 publisherShare = (msg.value * 90) / 100; // 90% to publisher, 10% to platform
        payable(publisher).transfer(publisherShare);
        payable(address(this)).transfer(msg.value - publisherShare);

        _transfer(publisher, msg.sender, tokenId);
        paperOwners[tokenId] = msg.sender;

        emit PaperPurchased(msg.sender, tokenId, publisher);
    }

    function getPapersByPublisher(address publisher)
        public
        view
        returns (PaperMetadata[] memory)
    {
        uint256[] memory tokenIds = publisherPapers[publisher];
        PaperMetadata[] memory publisherPapersMetadata = new PaperMetadata[](tokenIds.length);

        for (uint256 i = 0; i < tokenIds.length; i++) {
            publisherPapersMetadata[i] = papers[tokenIds[i]];
        }

        return publisherPapersMetadata;
    }

    function getAllPapers() public view returns (PaperMetadata[] memory, uint256[] memory) {
        uint256 totalPapers = _tokenIdCounter.current();
        PaperMetadata[] memory allPapers = new PaperMetadata[](totalPapers);
        uint256[] memory tokenIds = new uint256[](totalPapers);

        for (uint256 i = 0; i < totalPapers; i++) {
            allPapers[i] = papers[i];
            tokenIds[i] = i;
        }

        return (allPapers, tokenIds);
    }
}
