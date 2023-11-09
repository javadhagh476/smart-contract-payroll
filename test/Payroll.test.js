const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Payroll unit tests", () => {
      let payroll, accounts, owner, employeeAccount;
      const ownableErrorMessage = "OwnableUnauthorizedAccount";

      const fundContract = async (ethAmount) => {
        const amount = ethers.utils.parseEther(ethAmount);
        const txResponse = await owner.sendTransaction({
          to: payroll.address,
          value: amount,
        });
        await txResponse.wait();
      };

      beforeEach(async () => {
        await deployments.fixture(["payroll"]);
        payroll = await ethers.getContract("Payroll");
        accounts = await ethers.getSigners();
        owner = accounts[0];
        employeeAccount = accounts[1];
      });

      describe("constructor", () => {
        it("the contract is initialized correctly", async () => {
          const payrollEmployees = await payroll.listOutEmployees();
          assert.equal(payrollEmployees.length, 0);
        });
      });

      describe("addEmployee", () => {
        it("only the owner can add a Employee", async () => {
          const attackerAccount = accounts[2];
          const connectedPayroll = payroll.connect(attackerAccount);
          await expect(
            connectedPayroll.addEmployee(employeeAccount.address, 10, 20)
          ).to.be.revertedWith(ownableErrorMessage);
        });

        it("the amount must not be zero", async () => {
          await expect(
            payroll.addEmployee(employeeAccount.address, 0, 10)
          ).to.be.revertedWith("InvalidEmployeeData");
        });

        it("the payment interval must not be zero", async () => {
          await expect(
            payroll.addEmployee(employeeAccount.address, 50, 0)
          ).to.be.revertedWith("InvalidEmployeeData");
        });

        it("a Employee can't be added twice", async () => {
          await payroll.addEmployee(employeeAccount.address, 10, 20);
          await expect(
            payroll.addEmployee(employeeAccount.address, 20, 30)
          ).to.be.revertedWith("EmployeeAlreadyExists");
        });

        it("stores an added Employee and emits a EmployeeAdded event", async () => {
          const amount = 20;
          const interval = 30;
          const txResponse = await payroll.addEmployee(
            employeeAccount.address,
            amount,
            interval
          );
          const txReceipt = await txResponse.wait();
          assert.equal(txReceipt.events[0].event, "EmployeerAdded");
          assert.equal(
            txReceipt.events[0].args[0],
            employeeAccount.address
          );
         
        });
      });

      describe("removeEmployee", () => {
        it("removes a Employee and emits a EmployeeRemoved event", async () => {
          await payroll.addEmployee(employeeAccount.address, 10, 20);
          assert.equal((await payroll.listOutEmployees()).length, 1);
          const txResponse = await payroll.removeEmployee(
            employeeAccount.address
          );
          const txReceipt = await txResponse.wait(1);

          assert.equal(txReceipt.events[0].event, "EmployeerRemoved");
          assert.equal(
            txReceipt.events[0].args[0],
            employeeAccount.address
          );
          assert.equal((await payroll.listOutEmployees()).length, 0);
        });


      });

      describe("withdraw Fund", () => {
        it("only the owner can withdraw", async () => {
          const attackerAccount = accounts[2];
          const connectedPayroll = payroll.connect(attackerAccount);
          await expect(connectedPayroll.withdrawFunds(employeeAccount.address)).to.be.revertedWith(
            ownableErrorMessage
          );
        });
      });

    });
