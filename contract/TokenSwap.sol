pragma solidity ^0.8.0;

import "./CrowdsaleToken.sol";

contract TokenSwap {
    CrowdsaleToken public crowdsaleToken;
    uint256 public rate; // number of CrowdsaleToken tokens per wei

    constructor(CrowdsaleToken _crowdsaleToken, uint256 _rate) {
        crowdsaleToken = _crowdsaleToken;
        rate = _rate;
    }

    function swap() public payable {
        require(msg.value > 0, "Need to send some ETH");
        uint256 tokens = msg.value * rate * 1 ether;
        crowdsaleToken.mint(msg.sender, tokens);
    }
    
    // Allows contract owner to withdraw any ETH that's been sent here
    function withdraw() public {
        payable(msg.sender).transfer(address(this).balance);
    }
}