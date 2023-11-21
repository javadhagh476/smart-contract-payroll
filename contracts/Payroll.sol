// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./SafeMath.sol";

// Error declarations
error InvalidEmployeeData(address recipient, uint256 amount, uint256 interval);
error EmployeeAlreadyExists(address recipient);
error InvalidReceiptDate(address recipient, uint256 interval);
error PaymentWithdrawalFailed();

/// @title Payroll contract for managing employee salaries
contract Payroll is Ownable {
    using SafeMath for uint;

    // Struct to store employee information
    struct Employee {
        bool active;
        uint32 interval;
        uint256 amount;
        uint256 amountLastPayment;
        uint256 lastPaymentTimestamp;
        uint256 createdAt;
    }

    // Array to store employee addresses
    address[] private employeeAddresses;

    // Mapping to track employee details using their address
    mapping(address => Employee) public employers;

    // Instance of the ERC20 token contract
    IERC20 private customToken;

    // Events for contract actions
    event EmployeerAdded(
        address indexed employee,
        uint256 indexed amount,
        uint256 indexed interval
    );
    event EmployeerRemoved(address indexed employee);
    event InsufficientBalance(
        address indexed recipient,
        uint256 indexed requiredAmount,
        uint256 indexed contractBalance
    );
    event Transfer(
        address indexed from,
        address indexed to,
        uint256 indexed amount
    );

    /// @dev Modifier to check if an employee exists
    modifier employeeExists(address employee) {
        require(employers[employee].amount > 0, "Employee does not exist");
        _;
    }

    // Function to calculate time since the last payment for an employee
    function _calculateDate(address employee) private view returns (uint256) {
        if (employers[employee].lastPaymentTimestamp == 0) {
            return block.timestamp - employers[employee].createdAt;
        } else {
            return block.timestamp - employers[employee].lastPaymentTimestamp;
        }
    }

    // Constructor function initializes the contract
    constructor(address _usdtAddress) Ownable(msg.sender) {
        customToken = IERC20(_usdtAddress);
    }

    // Function to add a new employee to the payroll
    function addEmployee(
        address employee,
        uint256 amount,
        uint32 interval
    ) public onlyOwner {
        // Check for valid employee data
        if (amount == 0 || interval == 0) {
            revert InvalidEmployeeData(employee, amount, interval);
        }

        // Check if the employee already exists
        if (employers[employee].amount > 0) {
            revert EmployeeAlreadyExists(employee);
        }

        // Add employee details to storage
        employeeAddresses.push(employee);
        Employee storage newEmployer = employers[employee];
        newEmployer.active = true;
        newEmployer.interval = interval;
        newEmployer.amount = amount;
        newEmployer.createdAt = block.timestamp;

        emit EmployeerAdded(employee, amount, interval);
    }

    // Function to remove an employee from the payroll
    function removeEmployee(
        address employee
    ) public onlyOwner employeeExists(employee) {
        // Remove employee from the array and delete details from mapping
        for (uint256 i = 0; i < employeeAddresses.length; ++i) {
            if (employeeAddresses[i] == employee) {
                if (i < employeeAddresses.length - 1) {
                    for (uint256 j = i; j < employeeAddresses.length - 1; ++j) {
                        employeeAddresses[j] = employeeAddresses[j + 1];
                    }
                }
                employeeAddresses.pop();
                delete employers[employee];
                emit EmployeerRemoved(employee);
                break;
            }
        }
    }

    // Function to update an existing employee's details
    function updateEmployee(
        address employee,
        uint256 amount,
        uint32 interval
    ) public onlyOwner employeeExists(employee) {
        Employee storage updatedEmployee = employers[employee];

        // Update employee details if provided
        if (amount > 0) {
            updatedEmployee.amount = amount;
        }

        if (interval > 0) {
            updatedEmployee.interval = interval;
        }
    }

    // Function to list all employees added to the payroll
    function listOutEmployees()
        public
        view
        onlyOwner
        returns (address[] memory)
    {
        return employeeAddresses;
    }

    // Function to calculate the salary earned by an employee
    function paymentInvoice()
        public
        view
        employeeExists(msg.sender)
        returns (uint256)
    {
        address employee = msg.sender;
        uint256 timeSinceLastPayment = _calculateDate(employee);

        // Check if the payment receipt date is valid
        if (timeSinceLastPayment < employers[employee].interval) {
            revert InvalidReceiptDate(employee, employers[employee].interval);
        }

        // Calculate earned salary based on time passed since last payment
        uint256 timeToDateInSalary = timeSinceLastPayment.div(
            employers[employee].interval
        );
        uint256 salaryEarned = employers[employee].amount.mul(
            timeToDateInSalary
        );

        return salaryEarned;
    }

    // Function to allow an employee to withdraw their salary
    function requestWithdraw() public employeeExists(msg.sender) {
        address employee = msg.sender;
        uint256 salaryEarned = paymentInvoice();
        uint256 oldAmount = employers[employee].amountLastPayment;
        uint256 lastPayment = employers[employee].amountLastPayment;

        // Update employee's payment details and attempt token transfer
        employers[employee].amountLastPayment = salaryEarned;
        employers[employee].lastPaymentTimestamp = block.timestamp;
        uint256 tokenAmount = salaryEarned * 10 ** 18;
        bool success = customToken.transfer(employee, tokenAmount);

        if (success) {
            emit Transfer(address(this), msg.sender, salaryEarned);
        } else {
            // Revert changes if payment transfer fails
            employers[employee].amountLastPayment = oldAmount;
            employers[employee].lastPaymentTimestamp = lastPayment;
            revert PaymentWithdrawalFailed();
        }
    }

    // Function to allow the owner to withdraw funds from the contract
    function withdrawFunds(address fund) public onlyOwner {
        bool success = customToken.transfer(
            fund,
            customToken.balanceOf(address(this))
        );
        if (success) {
            emit Transfer(
                address(this),
                msg.sender,
                customToken.balanceOf(address(this))
            );
        } else {
            revert PaymentWithdrawalFailed();
        }
    }

    // Fallback functions to receive and handle Ether
    receive() external payable {}

    fallback() external payable {}
}
