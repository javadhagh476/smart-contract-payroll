

# Payroll Smart Contract  

Payroll Project - A Solidity smart contract for paying employees using the Custom token (USDT token) .

## Description

This project creates a Solidity smart contract for managing payroll payments to employees. It utilizes the USDT token for making salary payments, and employees can request and receive their salaries.
## Features  
- Ability to add, remove, and update employee information.
- Calculate the amount of salary to be paid to each employee.
- Allow employees to request salary payments. 
- Option to change the token used for salary payments.
## Development with Hardhat
 This project has been developed using the Hardhat development environment for Ethereum smart contracts. Hardhat provides a powerful and flexible toolkit for Ethereum development, making it easy to compile, test, and deploy smart contracts.
 
## Configuration

The project is configured using a `hardhat.config.js` file, and here are the key configuration settings:

- `COINMARKETCAP_API_KEY` (Optional): Your CoinMarketCap API key, if applicable.
- `SEPOLIA_RPC_URL`: The Sepolia RPC URL, typically provided by your Ethereum provider.
- `PRIVATE_KEY`: Your Ethereum account's private key for deployment.
- `ETHERSCAN_API_KEY` (Optional): Your Etherscan API key for contract verification.

For your local development and testing, you can use the following networks in the `hardhat.config.js` file:

- `hardhat`: The default Hardhat network with a specified `chainId`.
- `localhost`: A local network using HTTP with a specified `chainId`.

For production or external network deployment, use the `sepolia` network, which is configured with the provided `SEPOLIA_RPC_URL`, `PRIVATE_KEY`, and other settings.

The `solidity` section defines the Solidity compiler versions used in the project.

The `gasReporter` section is configured to provide gas usage reporting. It reports gas usage in USD and generates an output file named "gas-report.txt."

The `namedAccounts` section defines named accounts for deployment, and the `mocha` section configures the timeout for Mocha tests.

You can customize these settings in the `hardhat.config.js` file to suit your specific use case.

## Installation and Usage

1. Clone the project:
   ```sh
   git clone https://github.com/jvddev/smart-contract-payroll.git
   cd payroll

2. Install dependencies:
   ```sh
   yarn install
   
3. Deploy:
   ```sh
   yarn hardhat deploy
   Or
   yarn hardhat deploy --network sepolia
   Or
   yarn hardhat deploy --network localhost

## Contribution 
We welcome contributions to this project. To contribute, make suggestions, report issues, or submit pull requests, please use GitHub Issues and Pull Requests.
