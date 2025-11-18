const mysql = require('mysql2/promise');
require('dotenv').config();

(async function () {
  const DB_HOST = process.env.DB_HOST || '127.0.0.1';
  const DB_PORT = process.env.DB_PORT || 3306;
  const DB_NAME = process.env.DB_NAME || 'grassroots_db';
  const DB_USER = process.env.DB_USER || 'root';
  const DB_PASS = process.env.DB_PASS || '';

  console.log('Testing DB connection with:');
  console.log({ host: DB_HOST, port: DB_PORT, database: DB_NAME, user: DB_USER });

  try {
    const conn = await mysql.createConnection({ host: DB_HOST, port: DB_PORT, user: DB_USER, password: DB_PASS });
    console.log('Connected to MySQL server (no DB selected).');

    // Check privileges to create/go to DB
    try {
      await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      console.log('Database exists or was created successfully:', DB_NAME);
    } catch (createErr) {
      console.error('Could not create/use database. Error:');
      console.error(createErr && createErr.stack ? createErr.stack : createErr);
      await conn.end();
      process.exit(1);
    }

    // Connect specifically to the DB and run a test query
    await conn.changeUser({ database: DB_NAME });
    const [rows] = await conn.query('SELECT 1 AS ok');
    console.log('Test query result:', rows);

    await conn.end();
    console.log('DB test passed.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to connect to MySQL server. Error:');
    console.error(err && err.stack ? err.stack : err);
    console.error('\nCommon causes: MySQL server is not running, wrong host/port, wrong username/password, or insufficient privileges.');
    process.exit(1);
  }
})();
