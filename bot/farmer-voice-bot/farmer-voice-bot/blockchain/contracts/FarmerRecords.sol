// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * FarmerRecords - Smart Contract for storing farmer voice call records
 * Stores: farmer_id, timestamp, data_hash (SHA256), ipfs_cid
 */
contract FarmerRecords {
    
    struct FarmerRecord {
        string farmerId;
        uint256 timestamp;
        bytes32 dataHash;
        string ipfsCid;
        address recordedBy;
    }
    
    // Array to store all records
    FarmerRecord[] public records;
    
    // Mapping: dataHash => record exists (for deduplication)
    mapping(bytes32 => bool) public recordExists;
    
    // Mapping: farmer_id => list of record indices
    mapping(string => uint256[]) public farmerRecords;
    
    // Events
    event RecordAdded(
        uint256 indexed recordId,
        string indexed farmerId,
        uint256 timestamp,
        bytes32 dataHash,
        string ipfsCid
    );
    
    event RecordQueried(string indexed farmerId, uint256 recordCount);
    
    /**
     * Add a new farmer record
     * @param _farmerId Unique farmer identifier (pseudonymous)
     * @param _timestamp Unix timestamp of the record
     * @param _dataHash SHA256 hash of canonical JSON
     * @param _ipfsCid IPFS CID where audio is stored
     */
    function addRecord(
        string memory _farmerId,
        uint256 _timestamp,
        bytes32 _dataHash,
        string memory _ipfsCid
    ) public {
        require(_timestamp > 0, "Timestamp must be valid");
        require(_dataHash != bytes32(0), "Data hash cannot be empty");
        require(bytes(_farmerId).length > 0, "Farmer ID cannot be empty");
        require(bytes(_ipfsCid).length > 0, "IPFS CID cannot be empty");
        require(!recordExists[_dataHash], "Record with this hash already exists");
        
        FarmerRecord memory newRecord = FarmerRecord({
            farmerId: _farmerId,
            timestamp: _timestamp,
            dataHash: _dataHash,
            ipfsCid: _ipfsCid,
            recordedBy: msg.sender
        });
        
        records.push(newRecord);
        uint256 recordId = records.length - 1;
        
        recordExists[_dataHash] = true;
        farmerRecords[_farmerId].push(recordId);
        
        emit RecordAdded(recordId, _farmerId, _timestamp, _dataHash, _ipfsCid);
    }
    
    /**
     * Get total number of records
     */
    function recordCount() public view returns (uint256) {
        return records.length;
    }
    
    /**
     * Get record by index
     */
    function getRecord(uint256 _index) public view returns (
        string memory farmerId,
        uint256 timestamp,
        bytes32 dataHash,
        string memory ipfsCid
    ) {
        require(_index < records.length, "Record index out of bounds");
        FarmerRecord storage record = records[_index];
        return (record.farmerId, record.timestamp, record.dataHash, record.ipfsCid);
    }
    
    /**
     * Get all records for a farmer
     */
    function getfarmerRecordIndices(string memory _farmerId) public view returns (uint256[] memory) {
        return farmerRecords[_farmerId];
    }
    
    /**
     * Get farmer record count
     */
    function getFarmerRecordCount(string memory _farmerId) public view returns (uint256) {
        return farmerRecords[_farmerId].length;
    }
    
    /**
     * Verify record exists by data hash
     */
    function verifyRecord(bytes32 _dataHash) public view returns (bool) {
        return recordExists[_dataHash];
    }
    
    /**
     * Get all records (paginated)
     */
    function getAllRecords(uint256 _limit, uint256 _offset) public view returns (FarmerRecord[] memory) {
        require(_offset < records.length, "Offset out of bounds");
        
        uint256 returnSize = _limit;
        if (_offset + _limit > records.length) {
            returnSize = records.length - _offset;
        }
        
        FarmerRecord[] memory result = new FarmerRecord[](returnSize);
        for (uint256 i = 0; i < returnSize; i++) {
            result[i] = records[_offset + i];
        }
        return result;
    }
}
