const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
require("dotenv").config()


module.exports = async (hre) => {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const blockConfirmations = developmentChains.includes(network.name)
    ? 1
    : network.config.blockConfirmations;
  const arguments = ["0x779877A7B0D9E8603169DdbD7836e478b4624789"];
console.log(deployer)
  // Deploy the contract
  const payroll = await deploy("Payroll", {
    from: deployer,
    args: arguments,
    log: true,
    waitConfirmations: blockConfirmations || 1
  });

  // Verify the contract
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(payroll.address, arguments);
  }
};

module.exports.tags = ["all", "payroll"];
