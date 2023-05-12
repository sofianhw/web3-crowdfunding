pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CrowdsaleToken is ERC20 {
    constructor() ERC20("CrowdsaleToken", "CST") {}

    function mint(address _to, uint256 _amount) public {
        _mint(_to, _amount);
    }
}