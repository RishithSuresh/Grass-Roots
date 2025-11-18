// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Payment {
    event PaymentReceived(address indexed payer, uint256 amount, string orderId);

    function pay(string calldata orderId) external payable {
        require(msg.value > 0, "Payment must be greater than 0");
        emit PaymentReceived(msg.sender, msg.value, orderId);
    }
}
