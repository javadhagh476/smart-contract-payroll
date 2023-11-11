// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

error InvalidEmployeeData(address recipient, uint256 amount, uint256 interval);
error EmployeeAlreadyExists(address recipient);
error InvalidReceiptDate(address recipient, uint256 interval);
error PaymentWithdrawalFailed();

contract Payroll is Ownable {
    struct Employee {
        bool active;
        uint32 interval;
        uint256 amount;
        uint256 amountLastPayment;
        uint256 lastPaymentTimestamp;
        uint256 createdAt;
    }
    address[] private employeeAddresses;
    mapping(address => Employee) public employers;
    IERC20 private customToken;

    // Events
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
    modifier employeeExists(address employee) {
        require(employers[employee].amount > 0, "Employee does not exist");
        _;
    }

    function _calculateDate(address employee) private view returns (uint256) {
        if (employers[employee].lastPaymentTimestamp == 0) {
            return block.timestamp - employers[employee].createdAt;
        } else {
            return block.timestamp - employers[employee].lastPaymentTimestamp;
        }
    }

    constructor(address _usdtAddress) Ownable(msg.sender) {
        customToken = IERC20(_usdtAddress);
    }

    function addEmployee(
        address employee,
        uint256 amount,
        uint32 interval
    ) public onlyOwner {
        if (amount == 0 || interval == 0) {
            revert InvalidEmployeeData(employee, amount, interval);
        }

        if (employers[employee].amount > 0) {
            revert EmployeeAlreadyExists(employee);
        }
        employeeAddresses.push(employee);
        Employee storage newEmployer = employers[employee];
        newEmployer.active = true;
        newEmployer.interval = interval;
        newEmployer.amount = amount;
        newEmployer.createdAt = block.timestamp;

        emit EmployeerAdded(employee, amount, interval);
    }

    function removeEmployee(
        address employee
    ) public onlyOwner employeeExists(employee) {
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

    function updateEmployee(
        address employee,
        uint256 amount,
        uint32 interval
    ) public onlyOwner employeeExists(employee) {
        Employee storage updatedEmployee = employers[employee];

        if (amount > 0) {
            updatedEmployee.amount = amount;
        }

        if (interval > 0) {
            updatedEmployee.interval = interval;
        }
    }

    function listOutEmployees()
        public
        view
        onlyOwner
        returns (address[] memory)
    {
        return employeeAddresses;
    }

    function paymentInvoice()
        public
        view
        employeeExists(msg.sender)
        returns (uint256)
    {
        address employee = msg.sender;
        uint256 timeSinceLastPayment = _calculateDate(employee);

        if (timeSinceLastPayment < employers[employee].interval) {
            revert InvalidReceiptDate(employee, employers[employee].interval);
        }
        uint256 secondsInADay = 86400;
        uint256 daysInAMonth = 30;

        uint256 timeToDateInSalary = timeSinceLastPayment / secondsInADay;
        uint256 salaryEarned = (employers[employee].amount *
            timeToDateInSalary) / daysInAMonth;

        return (salaryEarned);
    }

    // function requestWithdraw() public payable employeeExists(msg.sender) {
    //     address employee = msg.sender;
    //     uint256 timeSinceLastPayment = _calculateDate(employee);

    //     if (timeSinceLastPayment < employers[employee].interval) {
    //         revert InvalidReceiptDate(employee, employers[employee].interval);
    //     }
    //     uint256 secondsInADay = 86400;
    //     uint256 daysInAMonth = 30;

    //     uint256 timeToDateInSalary = timeSinceLastPayment / secondsInADay;
    //     uint256 salaryEarned = (employers[employee].amount *
    //         timeToDateInSalary) / daysInAMonth;
    //     if (salaryEarned > address(this).balance) {
    //         emit InsufficientBalance(
    //             msg.sender,
    //             salaryEarned,
    //             address(this).balance
    //         );
    //     } else {
    //         uint256 oldAmount = employers[employee].amountLastPayment;
    //         uint256 lastPayment = employers[employee].amountLastPayment;

    //         employers[employee].amountLastPayment = salaryEarned;
    //         employers[employee].lastPaymentTimestamp = block.timestamp;

    //         (bool success, ) = payable(msg.sender).call{value: salaryEarned}(
    //             ""
    //         );
    //         if (success) {
    //             emit Transfer(address(this), msg.sender, salaryEarned);
    //         } else {
    //             employers[employee].amountLastPayment = oldAmount;
    //             employers[employee].lastPaymentTimestamp = lastPayment;
    //             revert PaymentWithdrawalFailed();
    //         }
    //     }
    // }

    function requestWithdraw() public employeeExists(msg.sender) {
        address employee = msg.sender;
        uint256 salaryEarned = paymentInvoice();
        uint256 oldAmount = employers[employee].amountLastPayment;
        uint256 lastPayment = employers[employee].amountLastPayment;

        employers[employee].amountLastPayment = salaryEarned;
        employers[employee].lastPaymentTimestamp = block.timestamp;

        bool success = customToken.transfer(employee, salaryEarned);

        if (success) {
            emit Transfer(address(this), msg.sender, salaryEarned);
        } else {
            employers[employee].amountLastPayment = oldAmount;
            employers[employee].lastPaymentTimestamp = lastPayment;
            revert PaymentWithdrawalFailed();
        }
    }

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

    receive() external payable {}

    fallback() external payable {}
}
