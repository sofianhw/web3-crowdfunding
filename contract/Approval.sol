pragma solidity ^0.8.0;

contract Approval {
    mapping(uint256 => bool) private approvals;

    function approve(uint256 _projectId) public {
        approvals[_projectId] = true;
    }

    function isApproved(uint256 _projectId) public view returns(bool) {
        return approvals[_projectId];
    }
}