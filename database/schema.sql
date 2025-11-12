-- GrassRoots SQL Database Schema
-- A comprehensive relational database for farmers, retailers, crops, and QR code management
-- Version 1.0 - November 2024

-- ============================================================
-- 1. USERS TABLE (Core Authentication & User Management)
-- ============================================================

CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(15),
    user_type ENUM('farmer', 'retailer', 'admin') NOT NULL,
    profile_picture_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_user_type (user_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 2. FARMER PROFILE TABLE
-- ============================================================

CREATE TABLE farmer_profiles (
    farmer_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    farm_name VARCHAR(255),
    farm_location VARCHAR(255),
    farm_area_acres DECIMAL(8,2),
    years_of_experience INT,
    farming_methods VARCHAR(255),
    certifications TEXT,
    bank_account_number VARCHAR(50),
    bank_name VARCHAR(255),
    ifsc_code VARCHAR(20),
    government_id_number VARCHAR(100),
    government_id_type ENUM('Aadhar', 'PAN', 'Voter_ID', 'License'),
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_location (farm_location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 3. RETAILER PROFILE TABLE
-- ============================================================

CREATE TABLE retailer_profiles (
    retailer_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    shop_name VARCHAR(255) NOT NULL,
    shop_location VARCHAR(255),
    business_type ENUM('Wholesale', 'Retail', 'Distributor', 'Supermarket') NOT NULL,
    shop_phone VARCHAR(15),
    shop_email VARCHAR(255),
    registration_number VARCHAR(100),
    registration_type ENUM('GST', 'Shop_License', 'Trade_License'),
    owner_name VARCHAR(255),
    owner_id_type ENUM('Aadhar', 'PAN', 'Voter_ID', 'License'),
    owner_id_number VARCHAR(100),
    shop_image_url VARCHAR(500),
    bank_account_number VARCHAR(50),
    bank_name VARCHAR(255),
    ifsc_code VARCHAR(20),
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_location (shop_location),
    INDEX idx_business_type (business_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 4. CROPS TABLE (Farmer's Crop Information)
-- ============================================================

CREATE TABLE crops (
    crop_id INT PRIMARY KEY AUTO_INCREMENT,
    farmer_id INT NOT NULL,
    crop_name VARCHAR(255) NOT NULL,
    crop_type ENUM('Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Vegetables', 'Fruits', 'Other') NOT NULL,
    planting_date DATE NOT NULL,
    expected_harvest_date DATE,
    area_acres DECIMAL(8,2) NOT NULL,
    expected_yield_quintals DECIMAL(10,2),
    fertilizer_used TEXT,
    pesticides_used TEXT,
    irrigation_method VARCHAR(255),
    soil_type VARCHAR(100),
    seed_variety VARCHAR(255),
    notes TEXT,
    status ENUM('Planning', 'Growing', 'Ready_to_Harvest', 'Harvested', 'Archived') DEFAULT 'Planning',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES farmer_profiles(farmer_id) ON DELETE CASCADE,
    INDEX idx_farmer_id (farmer_id),
    INDEX idx_crop_type (crop_type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 5. QR CODES TABLE (Crop QR Code Records)
-- ============================================================

CREATE TABLE qr_codes (
    qr_id INT PRIMARY KEY AUTO_INCREMENT,
    crop_id INT NOT NULL,
    farmer_id INT NOT NULL,
    qr_string VARCHAR(500) UNIQUE NOT NULL,
    qr_image_base64 LONGTEXT,
    qr_image_url VARCHAR(500),
    product_name VARCHAR(255) NOT NULL,
    crop_type VARCHAR(100),
    quality_grade ENUM('Premium (Grade A)', 'Good (Grade B)', 'Standard (Grade C)', 'Economy') NOT NULL,
    harvest_date DATE,
    farm_location VARCHAR(255),
    fertilizer_used TEXT,
    pesticides_used TEXT,
    batch_number VARCHAR(100),
    price_per_unit VARCHAR(50),
    additional_notes TEXT,
    scan_count INT DEFAULT 0,
    last_scanned_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (crop_id) REFERENCES crops(crop_id) ON DELETE CASCADE,
    FOREIGN KEY (farmer_id) REFERENCES farmer_profiles(farmer_id) ON DELETE CASCADE,
    INDEX idx_farmer_id (farmer_id),
    INDEX idx_crop_id (crop_id),
    INDEX idx_batch_number (batch_number),
    INDEX idx_scan_count (scan_count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 6. RETAILER PRODUCTS TABLE (Inventory Management)
-- ============================================================

CREATE TABLE retailer_products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    retailer_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_description TEXT,
    category VARCHAR(100),
    unit_price DECIMAL(10,2) NOT NULL,
    quantity_in_stock INT DEFAULT 0,
    unit_of_measurement ENUM('kg', 'liter', 'piece', 'dozen', 'gram') NOT NULL,
    supplier_farmer_id INT,
    reorder_level INT DEFAULT 10,
    product_image_url VARCHAR(500),
    is_organic BOOLEAN DEFAULT FALSE,
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (retailer_id) REFERENCES retailer_profiles(retailer_id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_farmer_id) REFERENCES farmer_profiles(farmer_id) ON DELETE SET NULL,
    INDEX idx_retailer_id (retailer_id),
    INDEX idx_category (category),
    INDEX idx_quantity (quantity_in_stock)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 7. RETAILER ORDERS TABLE
-- ============================================================

CREATE TABLE retailer_orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    retailer_id INT NOT NULL,
    product_id INT NOT NULL,
    farmer_id INT,
    quantity_ordered INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    order_status ENUM('Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Pending',
    delivery_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (retailer_id) REFERENCES retailer_profiles(retailer_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES retailer_products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (farmer_id) REFERENCES farmer_profiles(farmer_id) ON DELETE SET NULL,
    INDEX idx_retailer_id (retailer_id),
    INDEX idx_order_status (order_status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 8. PAYMENTS TABLE
-- ============================================================

CREATE TABLE payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    retailer_id INT NOT NULL,
    farmer_id INT,
    payment_amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('Cash', 'Bank_Transfer', 'UPI', 'Credit_Card', 'Debit_Card', 'Cheque') NOT NULL,
    payment_status ENUM('Pending', 'Completed', 'Failed', 'Refunded') DEFAULT 'Pending',
    transaction_id VARCHAR(100),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    invoice_number VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES retailer_orders(order_id) ON DELETE SET NULL,
    FOREIGN KEY (retailer_id) REFERENCES retailer_profiles(retailer_id) ON DELETE CASCADE,
    FOREIGN KEY (farmer_id) REFERENCES farmer_profiles(farmer_id) ON DELETE SET NULL,
    INDEX idx_retailer_id (retailer_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_payment_date (payment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 9. NOTIFICATIONS TABLE
-- ============================================================

CREATE TABLE notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    notification_type ENUM('Order', 'Payment', 'Crop_Update', 'Market_Price', 'QR_Scan', 'System', 'General') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_entity_type VARCHAR(50),
    related_entity_id INT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 10. MARKET PRICES TABLE
-- ============================================================

CREATE TABLE market_prices (
    price_id INT PRIMARY KEY AUTO_INCREMENT,
    crop_type VARCHAR(100) NOT NULL,
    market_location VARCHAR(255) NOT NULL,
    price_per_unit DECIMAL(10,2) NOT NULL,
    unit_type ENUM('kg', 'quintal', 'bag', 'dozen') NOT NULL,
    quality_grade ENUM('Premium', 'Good', 'Standard', 'Economy'),
    price_date DATE NOT NULL,
    trend ENUM('Up', 'Down', 'Stable'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_crop_type (crop_type),
    INDEX idx_market_location (market_location),
    INDEX idx_price_date (price_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 11. FARMER ACTIVITY LOG TABLE
-- ============================================================

CREATE TABLE farmer_activity_logs (
    activity_id INT PRIMARY KEY AUTO_INCREMENT,
    farmer_id INT NOT NULL,
    activity_type ENUM('Crop_Added', 'Crop_Updated', 'Crop_Harvested', 'QR_Generated', 'Sale_Made', 'Payment_Received', 'Profile_Updated') NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES farmer_profiles(farmer_id) ON DELETE CASCADE,
    INDEX idx_farmer_id (farmer_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 12. RETAILER ACTIVITY LOG TABLE
-- ============================================================

CREATE TABLE retailer_activity_logs (
    activity_id INT PRIMARY KEY AUTO_INCREMENT,
    retailer_id INT NOT NULL,
    activity_type ENUM('Product_Added', 'Product_Updated', 'Order_Placed', 'Payment_Made', 'Inventory_Updated', 'Profile_Updated') NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (retailer_id) REFERENCES retailer_profiles(retailer_id) ON DELETE CASCADE,
    INDEX idx_retailer_id (retailer_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 13. QR SCAN LOG TABLE (Analytics)
-- ============================================================

CREATE TABLE qr_scan_logs (
    scan_id INT PRIMARY KEY AUTO_INCREMENT,
    qr_id INT NOT NULL,
    scan_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    scanner_location VARCHAR(255),
    scanner_device VARCHAR(255),
    scanner_ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (qr_id) REFERENCES qr_codes(qr_id) ON DELETE CASCADE,
    INDEX idx_qr_id (qr_id),
    INDEX idx_scan_timestamp (scan_timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 14. MESSAGES/CHAT TABLE (Direct Communication)
-- ============================================================

CREATE TABLE messages (
    message_id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message_subject VARCHAR(255),
    message_body TEXT NOT NULL,
    message_type ENUM('Inquiry', 'Negotiation', 'Confirmation', 'General') DEFAULT 'General',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_sender_id (sender_id),
    INDEX idx_receiver_id (receiver_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 15. RATINGS & REVIEWS TABLE
-- ============================================================

CREATE TABLE ratings_reviews (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    reviewer_user_id INT NOT NULL,
    reviewed_user_id INT NOT NULL,
    product_id INT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review_title VARCHAR(255),
    review_text TEXT,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (reviewer_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES retailer_products(product_id) ON DELETE SET NULL,
    INDEX idx_reviewed_user_id (reviewed_user_id),
    INDEX idx_rating (rating),
    INDEX idx_review_date (review_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 16. FAVORITES/WISHLIST TABLE
-- ============================================================

CREATE TABLE favorites (
    favorite_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    farmer_id INT,
    product_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (farmer_id) REFERENCES farmer_profiles(farmer_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES retailer_products(product_id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (user_id, farmer_id, product_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 17. ADMIN AUDIT LOG TABLE
-- ============================================================

CREATE TABLE admin_audit_logs (
    audit_id INT PRIMARY KEY AUTO_INCREMENT,
    admin_user_id INT NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    changes_made TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_admin_user_id (admin_user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================

-- Query optimization indexes
CREATE INDEX idx_users_active ON users(is_active, created_at);
CREATE INDEX idx_crops_farmer_status ON crops(farmer_id, status);
CREATE INDEX idx_orders_status_date ON retailer_orders(order_status, created_at);
CREATE INDEX idx_payments_status_date ON payments(payment_status, payment_date);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);

-- ============================================================
-- CREATE VIEWS FOR COMMON QUERIES
-- ============================================================

-- View: Farmer Summary with crop and QR count
CREATE OR REPLACE VIEW farmer_summary AS
SELECT 
    f.farmer_id,
    f.user_id,
    u.full_name,
    u.email,
    f.farm_name,
    f.farm_location,
    COUNT(DISTINCT c.crop_id) as total_crops,
    COUNT(DISTINCT q.qr_id) as total_qr_codes,
    SUM(CASE WHEN q.qr_id IS NOT NULL THEN q.scan_count ELSE 0 END) as total_scans,
    f.created_at
FROM farmer_profiles f
JOIN users u ON f.user_id = u.user_id
LEFT JOIN crops c ON f.farmer_id = c.farmer_id
LEFT JOIN qr_codes q ON f.farmer_id = q.farmer_id
GROUP BY f.farmer_id, f.user_id, u.full_name, u.email, f.farm_name, f.farm_location, f.created_at;

-- View: Retailer Summary with products and orders
CREATE OR REPLACE VIEW retailer_summary AS
SELECT 
    r.retailer_id,
    r.user_id,
    u.full_name,
    u.email,
    r.shop_name,
    r.shop_location,
    COUNT(DISTINCT p.product_id) as total_products,
    COUNT(DISTINCT o.order_id) as total_orders,
    SUM(o.total_amount) as total_order_value,
    r.created_at
FROM retailer_profiles r
JOIN users u ON r.user_id = u.user_id
LEFT JOIN retailer_products p ON r.retailer_id = p.retailer_id
LEFT JOIN retailer_orders o ON r.retailer_id = o.retailer_id AND o.order_status != 'Cancelled'
GROUP BY r.retailer_id, r.user_id, u.full_name, u.email, r.shop_name, r.shop_location, r.created_at;

-- View: Top Performing QR Codes
CREATE OR REPLACE VIEW top_qr_codes AS
SELECT 
    qr_id,
    product_name,
    crop_type,
    batch_number,
    scan_count,
    last_scanned_at,
    created_at
FROM qr_codes
ORDER BY scan_count DESC
LIMIT 100;

-- View: Recent Orders Status
CREATE OR REPLACE VIEW recent_orders_view AS
SELECT 
    o.order_id,
    r.shop_name as retailer_shop,
    p.product_name,
    o.quantity_ordered,
    o.total_amount,
    o.order_status,
    o.created_at,
    f.farm_name
FROM retailer_orders o
JOIN retailer_profiles r ON o.retailer_id = r.retailer_id
JOIN retailer_products p ON o.product_id = p.product_id
LEFT JOIN farmer_profiles f ON o.farmer_id = f.farmer_id
ORDER BY o.created_at DESC;

-- ============================================================
-- STORED PROCEDURES
-- ============================================================

-- Procedure: Update QR scan count and timestamp
DELIMITER //
CREATE PROCEDURE record_qr_scan(
    IN p_qr_id INT,
    IN p_scan_location VARCHAR(255),
    IN p_device_info VARCHAR(255),
    IN p_ip_address VARCHAR(45)
)
BEGIN
    -- Insert into scan log
    INSERT INTO qr_scan_logs (qr_id, scanner_location, scanner_device, scanner_ip_address)
    VALUES (p_qr_id, p_scan_location, p_device_info, p_ip_address);
    
    -- Update QR code scan count and timestamp
    UPDATE qr_codes
    SET scan_count = scan_count + 1,
        last_scanned_at = CURRENT_TIMESTAMP
    WHERE qr_id = p_qr_id;
    
    SELECT 'QR scan recorded successfully' as result;
END //
DELIMITER ;

-- Procedure: Get farmer revenue summary
DELIMITER //
CREATE PROCEDURE get_farmer_revenue_summary(
    IN p_farmer_id INT
)
BEGIN
    SELECT 
        f.farm_name,
        COUNT(DISTINCT p.payment_id) as total_transactions,
        SUM(p.payment_amount) as total_revenue,
        COUNT(DISTINCT o.order_id) as total_orders,
        AVG(p.payment_amount) as average_payment,
        MAX(p.payment_date) as last_payment_date
    FROM farmer_profiles f
    LEFT JOIN payments p ON f.farmer_id = p.farmer_id AND p.payment_status = 'Completed'
    LEFT JOIN retailer_orders o ON f.farmer_id = o.farmer_id AND o.order_status != 'Cancelled'
    WHERE f.farmer_id = p_farmer_id
    GROUP BY f.farm_name;
END //
DELIMITER ;

-- Procedure: Get retailer sales summary
DELIMITER //
CREATE PROCEDURE get_retailer_sales_summary(
    IN p_retailer_id INT
)
BEGIN
    SELECT 
        r.shop_name,
        COUNT(DISTINCT o.order_id) as total_orders,
        SUM(o.total_amount) as total_sales,
        COUNT(DISTINCT p.product_id) as total_products,
        COUNT(DISTINCT CASE WHEN o.order_status = 'Delivered' THEN o.order_id END) as completed_orders,
        AVG(o.total_amount) as average_order_value
    FROM retailer_profiles r
    LEFT JOIN retailer_orders o ON r.retailer_id = o.retailer_id
    LEFT JOIN retailer_products p ON r.retailer_id = p.retailer_id
    WHERE r.retailer_id = p_retailer_id
    GROUP BY r.shop_name;
END //
DELIMITER ;

-- ============================================================
-- END OF SCHEMA
-- ============================================================

-- Database creation statement (run this first):
-- CREATE DATABASE grassroots_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE grassroots_db;
-- Then run the rest of the schema above.
