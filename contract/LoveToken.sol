pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LoveToken is ERC20 {
    constructor() ERC20("LoveToken", "LT") {}

    function mint(address _to, uint256 _amount) public {
        _mint(_to, _amount);
    }

    function burn(address from, uint256 amount) public {
        require(balanceOf(from) >= amount, "Insufficient balance");
        _burn(from, amount);
    }
}