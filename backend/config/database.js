/**
 * Database Configuration and Connection Pool
 * MySQL connection using mysql2 with promise support
 */

const mysql = require('mysql2');
require('dotenv').config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'grassroots_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    timezone: '+00:00',
    dateStrings: false,
    multipleStatements: false
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Get promise-based pool
const promisePool = pool.promise();

// Test database connection
const testConnection = async () => {
    try {
        const connection = await promisePool.getConnection();
        console.log('✅ Database connected successfully');
        console.log(`📊 Database: ${dbConfig.database}`);
        console.log(`🖥️  Host: ${dbConfig.host}:${dbConfig.port}`);
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
};

// Execute query with error handling
const executeQuery = async (sql, params = []) => {
    try {
        const [results] = await promisePool.execute(sql, params);
        return { success: true, data: results };
    } catch (error) {
        console.error('Query execution error:', error.message);
        return { success: false, error: error.message };
    }
};

// Execute multiple queries in transaction
const executeTransaction = async (queries) => {
    const connection = await promisePool.getConnection();
    try {
        await connection.beginTransaction();
        
        const results = [];
        for (const { sql, params } of queries) {
            const [result] = await connection.execute(sql, params);
            results.push(result);
        }
        
        await connection.commit();
        return { success: true, data: results };
    } catch (error) {
        await connection.rollback();
        console.error('Transaction error:', error.message);
        return { success: false, error: error.message };
    } finally {
        connection.release();
    }
};

// Get single row
const getOne = async (sql, params = []) => {
    try {
        const [rows] = await promisePool.execute(sql, params);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('Get one error:', error.message);
        return null;
    }
};

// Get multiple rows
const getMany = async (sql, params = []) => {
    try {
        const [rows] = await promisePool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('Get many error:', error.message);
        return [];
    }
};

// Insert and return ID
const insert = async (table, data) => {
    try {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map(() => '?').join(', ');
        
        const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
        const [result] = await promisePool.execute(sql, values);
        
        return { success: true, insertId: result.insertId };
    } catch (error) {
        console.error('Insert error:', error.message);
        return { success: false, error: error.message };
    }
};

// Update records
const update = async (table, data, where, whereParams = []) => {
    try {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const setClause = keys.map(key => `${key} = ?`).join(', ');
        
        const sql = `UPDATE ${table} SET ${setClause} WHERE ${where}`;
        const [result] = await promisePool.execute(sql, [...values, ...whereParams]);
        
        return { success: true, affectedRows: result.affectedRows };
    } catch (error) {
        console.error('Update error:', error.message);
        return { success: false, error: error.message };
    }
};

// Delete records
const deleteRecord = async (table, where, whereParams = []) => {
    try {
        const sql = `DELETE FROM ${table} WHERE ${where}`;
        const [result] = await promisePool.execute(sql, whereParams);
        
        return { success: true, affectedRows: result.affectedRows };
    } catch (error) {
        console.error('Delete error:', error.message);
        return { success: false, error: error.message };
    }
};

module.exports = {
    pool,
    promisePool,
    testConnection,
    executeQuery,
    executeTransaction,
    getOne,
    getMany,
    insert,
    update,
    deleteRecord
};

