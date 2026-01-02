// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Lock {
    struct LockInfo {
        address sender;
        address recipient;
        uint256 amount;
        uint256 unlockTime;
        bool withdrawn;
    }

    mapping(address => LockInfo[]) public userLocks;

    event Deposited(address indexed sender, address indexed recipient, uint256 amount, uint256 unlockTime);
    event Withdrawn(address indexed recipient, uint256 amount);

    function deposit(address _recipient, uint256 _unlockTime) external payable {
        require(_recipient != address(0), "Invalid recipient address");
        require(_unlockTime > block.timestamp, "Unlock time must be in the future");
        require(msg.value > 0, "Deposit must be greater than 0");

        userLocks[_recipient].push(LockInfo({
            sender: msg.sender,
            recipient: _recipient,
            amount: msg.value,
            unlockTime: _unlockTime,
            withdrawn: false
        }));

        emit Deposited(msg.sender, _recipient, msg.value, _unlockTime);
    }

    function withdraw(uint256 lockIndex) external {
        require(lockIndex < userLocks[msg.sender].length, "Invalid lock index");

        LockInfo storage lock = userLocks[msg.sender][lockIndex];

        require(msg.sender == lock.recipient, "Only recipient can withdraw");
        require(block.timestamp >= lock.unlockTime, "Too early to withdraw");
        require(!lock.withdrawn, "Already withdrawn");

        lock.withdrawn = true;
        (bool success, ) = payable(msg.sender).call{value: lock.amount}("");
        require(success, "Withdrawal failed");

        emit Withdrawn(msg.sender, lock.amount);
    }

    function getLocks(address user) external view returns (LockInfo[] memory) {
        return userLocks[user];
    }
}
