const web3 = new Web3(window.ethereum);
let defaultAccount;
const contractAddress = "0x21c7f99DA4117fc172b5ED1c599Afd9b00d568A7";
const contractABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_usdtAddress",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        }
      ],
      "name": "EmployeeAlreadyExists",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "interval",
          "type": "uint256"
        }
      ],
      "name": "InvalidEmployeeData",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "interval",
          "type": "uint256"
        }
      ],
      "name": "InvalidReceiptDate",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "OwnableInvalidOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "OwnableUnauthorizedAccount",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "PaymentWithdrawalFailed",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "employee",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "interval",
          "type": "uint256"
        }
      ],
      "name": "EmployeerAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "employee",
          "type": "address"
        }
      ],
      "name": "EmployeerRemoved",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "requiredAmount",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "contractBalance",
          "type": "uint256"
        }
      ],
      "name": "InsufficientBalance",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "employee",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "uint32",
          "name": "interval",
          "type": "uint32"
        }
      ],
      "name": "addEmployee",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "employers",
      "outputs": [
        {
          "internalType": "bool",
          "name": "active",
          "type": "bool"
        },
        {
          "internalType": "uint32",
          "name": "interval",
          "type": "uint32"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountLastPayment",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "lastPaymentTimestamp",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "createdAt",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "listOutEmployees",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "paymentInvoice",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "employee",
          "type": "address"
        }
      ],
      "name": "removeEmployee",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "requestWithdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "employee",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "uint32",
          "name": "interval",
          "type": "uint32"
        }
      ],
      "name": "updateEmployee",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "fund",
          "type": "address"
        }
      ],
      "name": "withdrawFunds",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    }
  ];
const payrollContract = new web3.eth.Contract(contractABI, contractAddress, { from: defaultAccount });

window.ethereum.on('accountsChanged', (accounts) => {
    defaultAccount = accounts[0];
    updateUI();
});

async function connectWallet() {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    defaultAccount = accounts[0];
    updateUI();
}

async function addEmployee() {
    const employeeAddress = document.getElementById("employeeAddress").value;
    const amount = document.getElementById("amount").value;
    const interval = document.getElementById("interval").value;
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const from = accounts[0];
    await payrollContract.methods.addEmployee(employeeAddress, amount, interval).send({from});
}

async function updateEmployee() {
    const employeeAddress = document.getElementById("employeeAddress").value;
    const amount = document.getElementById("amount").value;
    const interval = document.getElementById("interval").value;
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const from = accounts[0];
    await payrollContract.methods.updateEmployee(employeeAddress, amount, interval).send({from});
}
async function removeEmployee() {
    const employeeAddress = document.getElementById("employeeAddress").value;
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const from = accounts[0];
    await payrollContract.methods.removeEmployee(employeeAddress).send({from});
}

async function requestWithdraw() {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const from = accounts[0];
    await payrollContract.methods.requestWithdraw().send({from});
}

async function paymentInvoice() {
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  const from = accounts[0];
  const result = await payrollContract.methods.paymentInvoice().call({from});
  alert('Salary Earned: ' + result);
}

async function withdrawFunds() {
    const withdrawalAddress = document.getElementById("withdrawalAddress").value;
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const from = accounts[0];
    await payrollContract.methods.withdrawFunds(withdrawalAddress).send({from});
}

async function listOutEmployees() {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const from = accounts[0];
    const employeeList = await payrollContract.methods.listOutEmployees().call({from});

    const tableBody = document.getElementById("employeeList").getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ''; // Clear previous data

    for (const employee of employeeList) {
        const row = tableBody.insertRow(-1);
        const cell1 = row.insertCell(0);
       

        cell1.innerHTML = employee;
       
    }
}
function updateUI() {
    document.getElementById("currentAccount").innerText = `Current Account: ${defaultAccount}`;
}
