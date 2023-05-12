pragma solidity ^0.8.0;

import "./CrowdsaleToken.sol";
import "./LoveToken.sol";
import "./Approval.sol";

contract ProjectFundraise {
    struct Donation {
        address donor;
        uint256 amount;
    }

    struct Voter {
        address voter;
    }

    struct Project {
        address payable owner;
        string description;
        uint256 goal;
        uint256 amountRaised;
        mapping(uint => Donation) donations;
        uint256 numDonations;
        string imageUrl;
        uint256 deadline;
        uint256 votes;
        mapping(uint => Voter) voters;
        uint256 numVoters;
        bool isWithdraw;
    }

    Project[] public projects;
    CrowdsaleToken public crowdsaleToken;
    LoveToken public loveToken;
    Approval public approval;

    constructor(CrowdsaleToken _crowdsaleToken, LoveToken _loveToken, Approval _approval) {
        crowdsaleToken = _crowdsaleToken;
        loveToken = _loveToken;
        approval = _approval;
    }

    function createProject(string memory _description, uint256 _goal, string memory _imageUrl, uint256 _deadline) public {
        require(_deadline > block.timestamp, "Deadline should be in the future");

        Project storage newProject = projects.push();
        newProject.owner = payable(msg.sender);
        newProject.description = _description;
        newProject.goal = _goal;
        newProject.amountRaised = 0;
        newProject.imageUrl = _imageUrl;
        newProject.deadline = _deadline;
        newProject.votes = 0;
        newProject.numDonations = 0;
        newProject.numVoters = 0;
        newProject.isWithdraw = false;
    }


    function donate(uint256 _projectId, uint256 _amount) public {
        Project storage project = projects[_projectId];
        require(block.timestamp < project.deadline, "Project has reached its deadline");
        require(crowdsaleToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        project.amountRaised += _amount;
        project.donations[project.numDonations++] = Donation({donor: msg.sender, amount: _amount});
        loveToken.mint(msg.sender, _amount);
    }

    function approveTransfer(uint256 _projectId) public {
        Project storage project = projects[_projectId];
        require(project.amountRaised >= project.goal, "Project has not reached its goal");
        require(block.timestamp < project.deadline, "Project has reached its deadline");
        require(donorExists(_projectId, msg.sender), "Only donors can approve transfers");
        approval.approve(_projectId);
    }

    function transfer(uint256 _projectId) public {
        Project storage project = projects[_projectId];
        require(project.isWithdraw == false, "Already withdraw");
        require(project.owner == msg.sender, "Only project owner can transfer");
        require(project.amountRaised >= project.goal, "Project has not reached its goal");
        require(approval.isApproved(_projectId), "Transfer not approved");
        require(crowdsaleToken.transfer(project.owner, project.amountRaised), "Transfer failed");

        if (project.amountRaised >= project.goal) {
            loveToken.mint(project.owner, project.votes);
        }

        project.amountRaised = 0;
        project.isWithdraw = true;
    }

    function vote(uint256 _projectId) public {
        Project storage project = projects[_projectId];
        require(loveToken.balanceOf(msg.sender) > 0, "Must have LoveTokens to vote");
        require(!hasVoted(_projectId, msg.sender), "You have already voted for this project");

        loveToken.burn(msg.sender, 1);
        project.votes++;
        project.voters[project.numVoters++] = Voter({voter: msg.sender});
    }

    function hasVoted(uint256 _projectId, address _voter) private view returns(bool) {
        Project storage project = projects[_projectId];
        for(uint i = 0; i < project.numVoters; i++) {
            if(project.voters[i].voter == _voter) {
                return true;
            }
        }
        return false;
    }

    function donorExists(uint256 _projectId, address _donor) private view returns(bool) {
        Project storage project = projects[_projectId];
        for(uint i = 0; i < project.numDonations; i++) {
            if(project.donations[i].donor == _donor) {
                return true;
            }
        }
        return false;
    }

    function getProjectCount() public view returns(uint) {
        return projects.length;
    }

    function getProject(uint _projectId) public view returns(address owner, string memory description, uint256 goal, uint256 amountRaised, string memory imageUrl, uint256 deadline, uint256 votes) {
        Project storage project = projects[_projectId];
        return (project.owner, project.description, project.goal, project.amountRaised, project.imageUrl, project.deadline, project.votes);
    }

    function getDonations(uint _projectId) public view returns(address[] memory, uint256[] memory) {
        Project storage project = projects[_projectId];
        address[] memory donorAddresses = new address[](project.numDonations);
        uint256[] memory amounts = new uint256[](project.numDonations);
        for (uint i = 0; i < project.numDonations; i++) {
            donorAddresses[i] = project.donations[i].donor;
            amounts[i] = project.donations[i].amount;
        }
        return (donorAddresses, amounts);
    }

    function getVoters(uint _projectId) public view returns(address[] memory) {
        Project storage project = projects[_projectId];
        address[] memory voterAddresses = new address[](project.numVoters);
        for (uint i = 0; i < project.numVoters; i++) {
            voterAddresses[i] = project.voters[i].voter;
        }
        return voterAddresses;
    }

}
