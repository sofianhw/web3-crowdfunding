const Web3js = require("web3");

const IFundraise = require("./abi/Fundraise.json");
const F_CONTRACT_ABI = IFundraise.abi;
const F_CONTRACT_ADDRESS = '0xe05F67FA4Aa8Dd3Ba2F9f7ba4b7c36f8C7286C41';

const ICrowdToken = require("./abi/CrowdToken.json");
const CT_CONTRACT_ABI = ICrowdToken.abi;
const CT_CONTRACT_ADDRESS = '0xc87a916B4337Cc29C96bb12B2961bFCc5000F941';

const ILoveToken = require("./abi/LoveToken.json");
const LT_CONTRACT_ABI = ILoveToken.abi;
const LT_CONTRACT_ADDRESS = '0xb3a2a927000bc403952a169011330C9139Ce5EE0';

const ITokenSwap = require("./abi/TokenSwap.json");
const TS_CONTRACT_ABI = ITokenSwap.abi;
const TS_CONTRACT_ADDRESS = '0x95E5A887FDBf9d43412581e6fa62Ed518c9482cF';

let web3js, Fundraise, CrowdToken, LoveToken, TokenSwap, OwnerAddress;

const dataBox = document.getElementById('Data');
const statusBox = document.getElementById('status');

const connectButton = document.getElementById("connectButton");

const totalProjectBox = document.getElementById('totalProject');

const description = document.getElementById('inputDescription');
const goal = document.getElementById('inputGoal');
const imageUrl = document.getElementById('inputImageUrl');
const deadline = document.getElementById('inputDeadline');

const projectBox = document.getElementById('project');

const projectIdDonate = document.getElementById('inputProjectIdDonate');
const amountDonate = document.getElementById('inputAmount');

const projectIdVote = document.getElementById('inputProjectIdVote');
const projectIdApprove = document.getElementById('inputProjectIdApprove');
const projectIdTransfer = document.getElementById('inputProjectIdTransfer');

const CTBox = document.getElementById('CTBalance');
const LTBox = document.getElementById('LTBalance');

const swapAmount = document.getElementById('swapAmount');
const swapBalance = document.getElementById('swapBalance');
const rateValue = document.getElementById('rateValue');



(async () => {
    dataBox.hidden = true;
    if (typeof window.ethereum !== "undefined") {
        const accounts = await ethereum.request({ method: "eth_accounts" });
        if(accounts.length > 0){
            statusBox.innerHTML = "Your Address " + accounts[0];
            OwnerAddress = accounts[0];
            initiateContract(accounts[0]);
            connectButton.disabled = true;
            dataBox.hidden = false;
        } else {
            statusBox.innerHTML = "Please Connect";
            connectButton.hidden = false;
        }
    } else {
        statusBox.innerHTML = "Please install Metamask Pluggin";
        connectButton.hidden = true;
    }
})();

async function connect() {
    if (window.ethereum.isConnected()) {
        try {
            await ethereum.request({ method: "eth_requestAccounts" });
        } catch (error) {
            console.log(error);
        }
        
        statusBox.innerHTML = "Connected"
        let accounts = await ethereum.request({ method: "eth_accounts" });
        connectButton.innerHTML = accounts[0];
        
        initiateContract(accounts[0]);    
        dataBox.hidden = false;
        connectButton.disabled = true;
    }
}

async function initiateContract(account) {
    web3js = await new Web3js(Web3js.givenProvider);
    web3js.eth.defaultAccount = account;
    Fundraise = new web3js.eth.Contract(F_CONTRACT_ABI, F_CONTRACT_ADDRESS);
    CrowdToken = new web3js.eth.Contract(CT_CONTRACT_ABI, CT_CONTRACT_ADDRESS);
    LoveToken = new web3js.eth.Contract(LT_CONTRACT_ABI, LT_CONTRACT_ADDRESS);
    TokenSwap = new web3js.eth.Contract(TS_CONTRACT_ABI, TS_CONTRACT_ADDRESS);
}

// Get Project Counts 

async function getProjectCount() {
    const projectCount = await Fundraise.methods.getProjectCount().call();
    totalProjectBox.innerHTML = "Total Project : "+projectCount;
}

// Add Project

async function addProject() {
    const candidate = await Fundraise.methods.createProject(description.value, BigInt(goal.value), imageUrl.value, BigInt(deadline.value)).send({from: web3js.eth.defaultAccount});

    statusBox.innerHTML = "Project added!";
    getProjects();
}

// Get Projects

async function getProjects() {
    const totalProjects = await Fundraise.methods.getProjectCount().call();
    projectBox.innerHTML = "<tr><th>ID</th><th>Description</th><th>Goal</th><th>Image Url</th><th>Deadline</th><th>Vote Total</th><th>Amount Raise</th></tr>";
    let projectList = "";
    for( i=0 ; i<totalProjects ; i++){
        const project = await getProject(i);
        console.log(project);
        projectList += "<tr><td>" 
            + i + "</td>" + "<td>" 
            + project.description + "</td>" + "<td>" 
            + project.goal + "</td>" + "<td>" 
            + project.imageUrl + "</td>" + "<td>" 
            + project.deadline + "</td>" + "<td>" 
            + project.votes + "</td>" + "<td>" 
            + project.amountRaised + "</td></tr>";
    }
    projectBox.innerHTML += projectList;
}

// Get Project 

async function getProject(projectId) {
    const project = await Fundraise.methods.getProject(projectId).call();
    return project;
}

// Donate

async function Donate() {
    const allowance = await CrowdToken.methods.approve(F_CONTRACT_ADDRESS,BigInt(amountDonate.value)).send({from: web3js.eth.defaultAccount});
    const donate = await Fundraise.methods.donate(BigInt(projectIdDonate.value), BigInt(amountDonate.value)).send({from: web3js.eth.defaultAccount});

    statusBox.innerHTML = "Donation added!";
    getProjects();
}

// Vote

async function Vote() {
    const vote = await Fundraise.methods.vote(BigInt(projectIdVote.value)).send({from: web3js.eth.defaultAccount});

    statusBox.innerHTML = "Vote added!";
    getProjects();
}

// Approve

async function Approve() {
    const vote = await Fundraise.methods.approveTransfer(BigInt(projectIdApprove.value)).send({from: web3js.eth.defaultAccount});

    statusBox.innerHTML = "Approve added!";
    getProjects();
}

// Transfer

async function Transfer() {
    const vote = await Fundraise.methods.transfer(BigInt(projectIdTransfer.value)).send({from: web3js.eth.defaultAccount});

    statusBox.innerHTML = "Transfer!";
    getProjects();
}

// CT

async function getCrowdSaleToken() {
    const balance = await CrowdToken.methods.balanceOf(OwnerAddress).call();
    CTBox.innerHTML = "Total Balance : "+balance;
}

// LT

async function getLoveToken() {
    const balance = await LoveToken.methods.balanceOf(OwnerAddress).call();
    LTBox.innerHTML = "Total Balance : "+balance;
}

// Token Swap

async function Rate() {
    const rate = await TokenSwap.methods.rate().call();
    rateValue.innerHTML = "Rate 1 ETH : "+rate+" CST";
}

async function Swap() {
    const swap = await TokenSwap.methods.swap().send({from: web3js.eth.defaultAccount, value: parseInt(swapAmount.value)});
    swapBalance.innerHTML = "Total Swap : "+swapAmount.value+" CST";

}

async function Withdraw() {
    const swap = await TokenSwap.methods.withdraw().send({from: web3js.eth.defaultAccount});
}

module.exports = {
    connect,
    getProjectCount,
    addProject,
    getProjects,
    getProject,
    Donate,
    Vote,
    getCrowdSaleToken,
    getLoveToken,
    Rate,
    Swap,
    Withdraw,
    Approve,
    Transfer
};