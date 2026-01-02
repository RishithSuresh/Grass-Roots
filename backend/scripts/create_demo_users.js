/**
 * Script to create demo users for testing
 * Run with: node scripts/create_demo_users.js
 */

const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDemoUsers() {
    let connection;
    
    try {
        // Connect to database
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'grassroots_db'
        });

        console.log('✅ Connected to database');

        // Hash passwords
        const farmerPasswordHash = await bcrypt.hash('farmerpass', 10);
        const retailerPasswordHash = await bcrypt.hash('retailerpass', 10);

        console.log('🔐 Passwords hashed');

        // Check if demo users already exist
        const [existingFarmer] = await connection.execute(
            'SELECT user_id FROM users WHERE email = ?',
            ['farmer@demo.test']
        );

        const [existingRetailer] = await connection.execute(
            'SELECT user_id FROM users WHERE email = ?',
            ['retailer@demo.test']
        );

        // Create demo farmer if doesn't exist
        let farmerUserId;
        if (existingFarmer.length === 0) {
            const [farmerResult] = await connection.execute(
                `INSERT INTO users (user_type, email, password_hash, full_name, phone, is_active, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                ['farmer', 'farmer@demo.test', farmerPasswordHash, 'Demo Farmer', '9876543210', 1]
            );

            farmerUserId = farmerResult.insertId;
            console.log('✅ Demo farmer user created');
        } else {
            farmerUserId = existingFarmer[0].user_id;
            console.log('ℹ️  Demo farmer user already exists');
        }

        // Check if farmer profile exists
        const [existingFarmerProfile] = await connection.execute(
            'SELECT farmer_profile_id FROM farmer_profiles WHERE user_id = ?',
            [farmerUserId]
        );

        if (existingFarmerProfile.length === 0) {
            await connection.execute(
                `INSERT INTO farmer_profiles (user_id, farm_name, farm_size_acres, farm_type, farming_experience_years, created_at)
                 VALUES (?, ?, ?, ?, ?, NOW())`,
                [farmerUserId, 'Demo Farm, Karnataka', 10.5, 'organic', 5]
            );
            console.log('✅ Demo farmer profile created');
        } else {
            console.log('ℹ️  Demo farmer profile already exists');
        }

        console.log('   Email: farmer@demo.test');
        console.log('   Password: farmerpass');

        // Create demo retailer if doesn't exist
        let retailerUserId;
        if (existingRetailer.length === 0) {
            const [retailerResult] = await connection.execute(
                `INSERT INTO users (user_type, email, password_hash, full_name, phone, is_active, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                ['retailer', 'retailer@demo.test', retailerPasswordHash, 'Demo Retailer', '9876543211', 1]
            );

            retailerUserId = retailerResult.insertId;
            console.log('✅ Demo retailer user created');
        } else {
            retailerUserId = existingRetailer[0].user_id;
            console.log('ℹ️  Demo retailer user already exists');
        }

        // Check if retailer profile exists
        const [existingRetailerProfile] = await connection.execute(
            'SELECT retailer_profile_id FROM retailer_profiles WHERE user_id = ?',
            [retailerUserId]
        );

        if (existingRetailerProfile.length === 0) {
            await connection.execute(
                `INSERT INTO retailer_profiles (user_id, shop_name, shop_type, offers_home_delivery, created_at)
                 VALUES (?, ?, ?, ?, NOW())`,
                [retailerUserId, 'Demo Fresh Produce Shop', 'grocery', 1]
            );
            console.log('✅ Demo retailer profile created');
        } else {
            console.log('ℹ️  Demo retailer profile already exists');
        }

        console.log('   Email: retailer@demo.test');
        console.log('   Password: retailerpass');

        console.log('\n🎉 Demo users setup complete!');

    } catch (error) {
        console.error('❌ Error creating demo users:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

createDemoUsers();

