-- Insert demo users for testing
-- Passwords are hashed using bcrypt (10 rounds)

-- Demo Farmer User
-- Email: farmer@demo.test
-- Password: farmerpass
INSERT INTO users (user_type, email, password_hash, full_name, phone, is_active, created_at)
VALUES (
    'farmer',
    'farmer@demo.test',
    '$2a$10$YourHashWillGoHere1234567890123456789012345678901234',
    'Demo Farmer',
    '9876543210',
    1,
    NOW()
);

SET @farmer_user_id = LAST_INSERT_ID();

INSERT INTO farmer_profiles (user_id, farm_location, total_land_acres, created_at)
VALUES (
    @farmer_user_id,
    'Demo Farm Location',
    10.5,
    NOW()
);

-- Demo Retailer User
-- Email: retailer@demo.test
-- Password: retailerpass
INSERT INTO users (user_type, email, password_hash, full_name, phone, is_active, created_at)
VALUES (
    'retailer',
    'retailer@demo.test',
    '$2a$10$YourHashWillGoHere1234567890123456789012345678901234',
    'Demo Retailer',
    '9876543211',
    1,
    NOW()
);

SET @retailer_user_id = LAST_INSERT_ID();

INSERT INTO retailer_profiles (user_id, shop_name, shop_address, created_at)
VALUES (
    @retailer_user_id,
    'Demo Shop',
    'Demo Shop Address',
    NOW()
);

