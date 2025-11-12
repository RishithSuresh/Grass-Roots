// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TransactionRegistry {
    event TransactionRegistered(
        uint256 indexed id,
        string txId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        string metadata,
        uint256 timestamp
    );

    struct Tx {
        string txId;
        address buyer;
        address seller;
        uint256 amount;
        string metadata;
        uint256 timestamp;
    }

    Tx[] public transactions;

    function registerTransaction(
        string calldata txId,
        address buyer,
        address seller,
        uint256 amount,
        string calldata metadata
    ) external returns (uint256) {
        uint256 id = transactions.length;
        transactions.push(Tx(txId, buyer, seller, amount, metadata, block.timestamp));
        emit TransactionRegistered(id, txId, buyer, seller, amount, metadata, block.timestamp);
        return id;
    }

    function getTransaction(uint256 id) external view returns (string memory, address, address, uint256, string memory, uint256) {
        Tx storage t = transactions[id];
        return (t.txId, t.buyer, t.seller, t.amount, t.metadata, t.timestamp);
    }
}
