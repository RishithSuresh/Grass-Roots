-- ============================================================================
-- GRASSROOTS AGRICULTURAL MARKETPLACE - COMPREHENSIVE DATABASE SCHEMA
-- ============================================================================
-- Version: 1.0.0
-- Database: MySQL 8.0+
-- Description: Complete schema for farmers, retailers, crops, products,
--              orders, payments, QR codes, market prices, and blockchain integration
-- ============================================================================

-- Drop database if exists and create fresh
DROP DATABASE IF EXISTS grassroots_db;
CREATE DATABASE grassroots_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE grassroots_db;

-- ============================================================================
-- TABLE 1: USERS (Unified table for Farmers and Retailers)
-- ============================================================================
CREATE TABLE users (
    user_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_type ENUM('farmer', 'retailer') NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    
    -- Address fields
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    country VARCHAR(100) DEFAULT 'India',
    
    -- Geolocation
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Profile fields
    profile_image_url VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_document_url VARCHAR(500),
    
    -- Account status
    is_active BOOLEAN DEFAULT TRUE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires DATETIME,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL,
    
    -- Indexes
    INDEX idx_user_type (user_type),
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_city_state (city, state),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 2: FARMER PROFILES (Extended farmer-specific data)
-- ============================================================================
CREATE TABLE farmer_profiles (
    farmer_profile_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE,
    
    -- Farm details
    farm_name VARCHAR(255),
    farm_size_acres DECIMAL(10, 2),
    farm_type ENUM('organic', 'conventional', 'mixed') DEFAULT 'conventional',
    farming_experience_years INT,
    
    -- Bank details for payments
    bank_account_number VARCHAR(50),
    bank_ifsc_code VARCHAR(20),
    bank_name VARCHAR(255),
    bank_branch VARCHAR(255),
    upi_id VARCHAR(100),
    
    -- Statistics
    total_crops_listed INT DEFAULT 0,
    total_sales DECIMAL(15, 2) DEFAULT 0.00,
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_farm_type (farm_type),
    INDEX idx_farm_size (farm_size_acres)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 3: RETAILER PROFILES (Extended retailer-specific data)
-- ============================================================================
CREATE TABLE retailer_profiles (
    retailer_profile_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE,
    
    -- Shop details
    shop_name VARCHAR(255) NOT NULL,
    shop_type ENUM('grocery', 'supermarket', 'wholesale', 'restaurant', 'other') DEFAULT 'grocery',
    gst_number VARCHAR(20),
    business_license_number VARCHAR(100),
    
    -- Operating hours
    opening_time TIME,
    closing_time TIME,
    working_days VARCHAR(100), -- JSON array: ["Monday", "Tuesday", ...]
    
    -- Delivery options
    offers_home_delivery BOOLEAN DEFAULT FALSE,
    delivery_radius_km DECIMAL(5, 2),
    minimum_order_amount DECIMAL(10, 2),
    
    -- Statistics
    total_products_listed INT DEFAULT 0,
    total_purchases DECIMAL(15, 2) DEFAULT 0.00,
    total_orders INT DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_shop_type (shop_type),
    INDEX idx_gst_number (gst_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 4: CROP CATEGORIES (Master data for crop types)
-- ============================================================================
CREATE TABLE crop_categories (
    category_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    category_description TEXT,
    category_image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_category_name (category_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 5: CROPS (Farmer's crop listings)
-- ============================================================================
CREATE TABLE crops (
    crop_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    farmer_id BIGINT UNSIGNED NOT NULL,
    category_id INT UNSIGNED,

    -- Crop details
    crop_name VARCHAR(255) NOT NULL,
    crop_variety VARCHAR(255),
    crop_type ENUM('vegetable', 'fruit', 'grain', 'pulse', 'spice', 'other') NOT NULL,

    -- Quantity and pricing
    quantity_available DECIMAL(10, 2) NOT NULL, -- in kg/quintal
    unit ENUM('kg', 'quintal', 'ton', 'piece', 'dozen') DEFAULT 'kg',
    price_per_unit DECIMAL(10, 2) NOT NULL,

    -- Quality and certification
    quality_grade ENUM('A+', 'A', 'B', 'C') DEFAULT 'A',
    is_organic BOOLEAN DEFAULT FALSE,
    organic_certificate_url VARCHAR(500),

    -- Harvest details
    harvest_date DATE,
    expected_harvest_date DATE,
    sowing_date DATE,

    -- Storage and handling
    storage_location VARCHAR(255),
    storage_temperature VARCHAR(50),
    shelf_life_days INT,

    -- Description and images
    description TEXT,
    image_url_1 VARCHAR(500),
    image_url_2 VARCHAR(500),
    image_url_3 VARCHAR(500),

    -- QR Code
    qr_code_data TEXT, -- JSON data for QR code
    qr_code_image_url VARCHAR(500),

    -- Blockchain integration
    blockchain_hash VARCHAR(255),
    blockchain_transaction_id VARCHAR(255),

    -- Status
    status ENUM('available', 'sold', 'reserved', 'expired') DEFAULT 'available',
    is_featured BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (farmer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES crop_categories(category_id) ON DELETE SET NULL,
    INDEX idx_farmer_id (farmer_id),
    INDEX idx_crop_type (crop_type),
    INDEX idx_status (status),
    INDEX idx_is_organic (is_organic),
    INDEX idx_harvest_date (harvest_date),
    INDEX idx_created_at (created_at),
    FULLTEXT idx_crop_search (crop_name, crop_variety, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 6: MARKET PRICES (Real-time market price data)
-- ============================================================================
CREATE TABLE market_prices (
    price_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    -- Crop identification
    crop_name VARCHAR(255) NOT NULL,
    crop_variety VARCHAR(255),

    -- Location
    market_name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,

    -- Price data
    min_price DECIMAL(10, 2) NOT NULL,
    max_price DECIMAL(10, 2) NOT NULL,
    modal_price DECIMAL(10, 2) NOT NULL, -- Most common price
    unit ENUM('kg', 'quintal', 'ton') DEFAULT 'quintal',

    -- Market data
    arrivals_quantity DECIMAL(10, 2), -- Quantity arrived in market
    price_date DATE NOT NULL,

    -- Trend analysis
    price_change_percentage DECIMAL(5, 2), -- % change from previous day
    trend ENUM('up', 'down', 'stable') DEFAULT 'stable',

    -- Data source
    data_source VARCHAR(100), -- e.g., "AGMARKNET", "Manual Entry"

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_crop_name (crop_name),
    INDEX idx_market_city (city, state),
    INDEX idx_price_date (price_date),
    INDEX idx_created_at (created_at),
    UNIQUE KEY unique_price_entry (crop_name, market_name, price_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 7: PRODUCTS (Retailer's product catalog)
-- ============================================================================
CREATE TABLE products (
    product_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    retailer_id BIGINT UNSIGNED NOT NULL,
    crop_id BIGINT UNSIGNED, -- Link to original crop if sourced from platform

    -- Product details
    product_name VARCHAR(255) NOT NULL,
    product_category VARCHAR(100),
    brand_name VARCHAR(255),

    -- Quantity and pricing
    quantity_in_stock DECIMAL(10, 2) NOT NULL,
    unit ENUM('kg', 'gram', 'liter', 'piece', 'dozen', 'packet') DEFAULT 'kg',
    selling_price DECIMAL(10, 2) NOT NULL,
    mrp DECIMAL(10, 2),
    cost_price DECIMAL(10, 2), -- Purchase price
    discount_percentage DECIMAL(5, 2) DEFAULT 0.00,

    -- Product specifications
    weight_per_unit DECIMAL(10, 2),
    weight_unit ENUM('kg', 'gram', 'liter', 'ml'),

    -- Quality and sourcing
    source_type ENUM('platform', 'external', 'own_production') DEFAULT 'external',
    source_farmer_id BIGINT UNSIGNED, -- If sourced from platform
    is_organic BOOLEAN DEFAULT FALSE,

    -- Description and images
    description TEXT,
    image_url_1 VARCHAR(500),
    image_url_2 VARCHAR(500),
    image_url_3 VARCHAR(500),

    -- Barcode and SKU
    barcode VARCHAR(100),
    sku VARCHAR(100),

    -- QR Code (scanned from farmer)
    scanned_qr_data TEXT,

    -- Status
    status ENUM('in_stock', 'out_of_stock', 'discontinued') DEFAULT 'in_stock',
    is_featured BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (retailer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (crop_id) REFERENCES crops(crop_id) ON DELETE SET NULL,
    FOREIGN KEY (source_farmer_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_retailer_id (retailer_id),
    INDEX idx_crop_id (crop_id),
    INDEX idx_status (status),
    INDEX idx_product_category (product_category),
    INDEX idx_barcode (barcode),
    INDEX idx_sku (sku),
    FULLTEXT idx_product_search (product_name, brand_name, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 8: ORDERS (Customer orders to retailers)
-- ============================================================================
CREATE TABLE orders (
    order_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    retailer_id BIGINT UNSIGNED NOT NULL,

    -- Customer details (can be guest or registered)
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),

    -- Delivery address
    delivery_address_line1 VARCHAR(255) NOT NULL,
    delivery_address_line2 VARCHAR(255),
    delivery_city VARCHAR(100) NOT NULL,
    delivery_state VARCHAR(100) NOT NULL,
    delivery_pincode VARCHAR(10) NOT NULL,

    -- Order details
    order_number VARCHAR(50) NOT NULL UNIQUE,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Pricing
    subtotal DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    delivery_charges DECIMAL(10, 2) DEFAULT 0.00,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,

    -- Payment
    payment_method ENUM('cash', 'upi', 'card', 'netbanking', 'wallet') DEFAULT 'cash',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    payment_date DATETIME,
    payment_transaction_id VARCHAR(255),

    -- Order status
    order_status ENUM('pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',

    -- Delivery
    delivery_type ENUM('home_delivery', 'store_pickup') DEFAULT 'home_delivery',
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    delivery_partner VARCHAR(100),
    tracking_number VARCHAR(100),

    -- Notes
    customer_notes TEXT,
    retailer_notes TEXT,
    cancellation_reason TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (retailer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_retailer_id (retailer_id),
    INDEX idx_order_number (order_number),
    INDEX idx_order_status (order_status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_order_date (order_date),
    INDEX idx_customer_phone (customer_phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 9: ORDER ITEMS (Individual items in an order)
-- ============================================================================
CREATE TABLE order_items (
    order_item_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,

    -- Product snapshot (in case product details change)
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100),

    -- Quantity and pricing
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20),
    unit_price DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    total_price DECIMAL(10, 2) NOT NULL,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 10: PAYMENTS (Payment transactions)
-- ============================================================================
CREATE TABLE payments (
    payment_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED,

    -- Payer details
    payer_type ENUM('retailer', 'customer', 'farmer') NOT NULL,
    payer_id BIGINT UNSIGNED,

    -- Payee details
    payee_type ENUM('farmer', 'retailer', 'platform') NOT NULL,
    payee_id BIGINT UNSIGNED,

    -- Payment details
    payment_type ENUM('order_payment', 'crop_purchase', 'subscription', 'commission', 'refund') NOT NULL,
    payment_method ENUM('cash', 'upi', 'card', 'netbanking', 'wallet', 'bank_transfer') NOT NULL,

    -- Amount
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',

    -- Transaction details
    transaction_id VARCHAR(255) UNIQUE,
    payment_gateway VARCHAR(100), -- e.g., "Razorpay", "PayTM"
    gateway_transaction_id VARCHAR(255),
    gateway_response TEXT, -- JSON response from gateway

    -- Status
    payment_status ENUM('pending', 'processing', 'success', 'failed', 'refunded', 'cancelled') DEFAULT 'pending',

    -- Blockchain integration
    blockchain_hash VARCHAR(255),
    blockchain_transaction_id VARCHAR(255),

    -- Dates
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    settlement_date DATE,

    -- Notes
    payment_notes TEXT,
    failure_reason TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE SET NULL,
    INDEX idx_order_id (order_id),
    INDEX idx_payer (payer_type, payer_id),
    INDEX idx_payee (payee_type, payee_id),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_payment_date (payment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 11: TRANSACTIONS (Farmer-Retailer direct transactions)
-- ============================================================================
CREATE TABLE transactions (
    transaction_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    farmer_id BIGINT UNSIGNED NOT NULL,
    retailer_id BIGINT UNSIGNED NOT NULL,
    crop_id BIGINT UNSIGNED NOT NULL,

    -- Transaction details
    transaction_number VARCHAR(50) NOT NULL UNIQUE,
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Quantity and pricing
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20),
    price_per_unit DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,

    -- Payment
    payment_method ENUM('cash', 'upi', 'bank_transfer', 'cheque') DEFAULT 'cash',
    payment_status ENUM('pending', 'partial', 'completed') DEFAULT 'pending',
    amount_paid DECIMAL(15, 2) DEFAULT 0.00,
    amount_pending DECIMAL(15, 2),

    -- Delivery
    delivery_status ENUM('pending', 'in_transit', 'delivered') DEFAULT 'pending',
    delivery_date DATE,

    -- Quality check
    quality_rating DECIMAL(3, 2), -- Rating given by retailer
    quality_notes TEXT,

    -- Blockchain
    blockchain_hash VARCHAR(255),
    blockchain_verified BOOLEAN DEFAULT FALSE,

    -- Status
    transaction_status ENUM('active', 'completed', 'cancelled', 'disputed') DEFAULT 'active',

    -- Notes
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (farmer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (retailer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (crop_id) REFERENCES crops(crop_id) ON DELETE RESTRICT,
    INDEX idx_farmer_id (farmer_id),
    INDEX idx_retailer_id (retailer_id),
    INDEX idx_crop_id (crop_id),
    INDEX idx_transaction_number (transaction_number),
    INDEX idx_transaction_date (transaction_date),
    INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 12: QR CODES (QR code generation and tracking)
-- ============================================================================
CREATE TABLE qr_codes (
    qr_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    -- Entity reference
    entity_type ENUM('crop', 'product', 'farmer', 'retailer') NOT NULL,
    entity_id BIGINT UNSIGNED NOT NULL,

    -- QR Code data
    qr_code_string VARCHAR(500) NOT NULL UNIQUE,
    qr_code_image_url VARCHAR(500),
    qr_data JSON, -- Complete data encoded in QR

    -- Tracking
    scan_count INT DEFAULT 0,
    last_scanned_at TIMESTAMP NULL,
    last_scanned_by BIGINT UNSIGNED,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    expires_at DATETIME,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_qr_code_string (qr_code_string),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 13: REVIEWS AND RATINGS
-- ============================================================================
CREATE TABLE reviews (
    review_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    -- Review target
    review_type ENUM('farmer', 'retailer', 'crop', 'product', 'transaction') NOT NULL,
    target_id BIGINT UNSIGNED NOT NULL,

    -- Reviewer
    reviewer_type ENUM('farmer', 'retailer', 'customer') NOT NULL,
    reviewer_id BIGINT UNSIGNED,
    reviewer_name VARCHAR(255),

    -- Rating and review
    rating DECIMAL(3, 2) NOT NULL CHECK (rating >= 0 AND rating <= 5),
    review_title VARCHAR(255),
    review_text TEXT,

    -- Images
    image_url_1 VARCHAR(500),
    image_url_2 VARCHAR(500),
    image_url_3 VARCHAR(500),

    -- Status
    is_verified BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_review_type_target (review_type, target_id),
    INDEX idx_reviewer (reviewer_type, reviewer_id),
    INDEX idx_rating (rating),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 14: NOTIFICATIONS
-- ============================================================================
CREATE TABLE notifications (
    notification_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    -- Recipient
    user_id BIGINT UNSIGNED NOT NULL,

    -- Notification details
    notification_type ENUM('order', 'payment', 'crop', 'price_alert', 'system', 'promotion') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,

    -- Action link
    action_url VARCHAR(500),
    action_text VARCHAR(100),

    -- Related entity
    related_entity_type VARCHAR(50),
    related_entity_id BIGINT UNSIGNED,

    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,

    -- Priority
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_notification_type (notification_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 15: PRICE ALERTS (User-configured price alerts)
-- ============================================================================
CREATE TABLE price_alerts (
    alert_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,

    -- Alert configuration
    crop_name VARCHAR(255) NOT NULL,
    target_price DECIMAL(10, 2) NOT NULL,
    alert_condition ENUM('above', 'below', 'equals') NOT NULL,

    -- Location filter
    city VARCHAR(100),
    state VARCHAR(100),

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_triggered BOOLEAN DEFAULT FALSE,
    triggered_at TIMESTAMP NULL,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_crop_name (crop_name),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 16: ACTIVITY LOGS (Audit trail)
-- ============================================================================
CREATE TABLE activity_logs (
    log_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    -- User
    user_id BIGINT UNSIGNED,
    user_type VARCHAR(50),

    -- Activity
    activity_type VARCHAR(100) NOT NULL,
    activity_description TEXT,

    -- Request details
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_method VARCHAR(10),
    request_url VARCHAR(500),

    -- Related entity
    entity_type VARCHAR(50),
    entity_id BIGINT UNSIGNED,

    -- Additional data
    metadata JSON,

    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_id (user_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_created_at (created_at),
    INDEX idx_entity (entity_type, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 17: BLOCKCHAIN RECORDS (Blockchain transaction tracking)
-- ============================================================================
CREATE TABLE blockchain_records (
    blockchain_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    -- Transaction details
    transaction_type ENUM('crop_listing', 'payment', 'transfer', 'verification') NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT UNSIGNED NOT NULL,

    -- Blockchain data
    blockchain_network VARCHAR(50) DEFAULT 'Ethereum',
    contract_address VARCHAR(255),
    transaction_hash VARCHAR(255) NOT NULL UNIQUE,
    block_number BIGINT UNSIGNED,
    block_timestamp DATETIME,

    -- Gas and fees
    gas_used BIGINT UNSIGNED,
    gas_price DECIMAL(20, 10),
    transaction_fee DECIMAL(20, 10),

    -- Status
    status ENUM('pending', 'confirmed', 'failed') DEFAULT 'pending',
    confirmations INT DEFAULT 0,

    -- Data
    transaction_data JSON,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_transaction_hash (transaction_hash),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- VIEWS FOR EFFICIENT QUERIES
-- ============================================================================

-- View: Farmer Dashboard Summary
CREATE VIEW vw_farmer_dashboard AS
SELECT
    u.user_id,
    u.full_name,
    u.email,
    fp.farm_name,
    fp.total_crops_listed,
    fp.total_sales,
    fp.average_rating,
    COUNT(DISTINCT c.crop_id) as active_crops,
    COUNT(DISTINCT t.transaction_id) as total_transactions,
    COALESCE(SUM(t.total_amount), 0) as total_revenue
FROM users u
LEFT JOIN farmer_profiles fp ON u.user_id = fp.user_id
LEFT JOIN crops c ON u.user_id = c.farmer_id AND c.status = 'available'
LEFT JOIN transactions t ON u.user_id = t.farmer_id
WHERE u.user_type = 'farmer'
GROUP BY u.user_id;

-- View: Retailer Dashboard Summary
CREATE VIEW vw_retailer_dashboard AS
SELECT
    u.user_id,
    u.full_name,
    u.email,
    rp.shop_name,
    rp.total_products_listed,
    rp.total_purchases,
    rp.total_orders,
    COUNT(DISTINCT p.product_id) as active_products,
    COUNT(DISTINCT o.order_id) as pending_orders,
    COALESCE(SUM(o.total_amount), 0) as total_order_value
FROM users u
LEFT JOIN retailer_profiles rp ON u.user_id = rp.user_id
LEFT JOIN products p ON u.user_id = p.retailer_id AND p.status = 'in_stock'
LEFT JOIN orders o ON u.user_id = o.retailer_id AND o.order_status IN ('pending', 'confirmed', 'processing')
WHERE u.user_type = 'retailer'
GROUP BY u.user_id;

-- View: Market Price Trends
CREATE VIEW vw_market_price_trends AS
SELECT
    crop_name,
    city,
    state,
    AVG(modal_price) as avg_price,
    MIN(min_price) as lowest_price,
    MAX(max_price) as highest_price,
    COUNT(*) as price_entries,
    MAX(price_date) as latest_date
FROM market_prices
WHERE price_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY crop_name, city, state;

-- View: Active Crop Listings
CREATE VIEW vw_active_crops AS
SELECT
    c.*,
    u.full_name as farmer_name,
    u.phone as farmer_phone,
    u.city as farmer_city,
    u.state as farmer_state,
    fp.farm_name,
    fp.average_rating as farmer_rating,
    cc.category_name
FROM crops c
JOIN users u ON c.farmer_id = u.user_id
LEFT JOIN farmer_profiles fp ON u.user_id = fp.user_id
LEFT JOIN crop_categories cc ON c.category_id = cc.category_id
WHERE c.status = 'available' AND u.is_active = TRUE;

-- ============================================================================
-- SAMPLE DATA INSERTION
-- ============================================================================

-- Insert Crop Categories
INSERT INTO crop_categories (category_name, category_description) VALUES
('Vegetables', 'Fresh vegetables including leafy greens, root vegetables, and more'),
('Fruits', 'Fresh seasonal and exotic fruits'),
('Grains', 'Cereals and grain crops including rice, wheat, and millets'),
('Pulses', 'Lentils, beans, and other pulse crops'),
('Spices', 'Aromatic spices and herbs'),
('Oilseeds', 'Oil-producing seeds and nuts');

-- Insert Sample Users (Farmers)
-- Password: 'password123' hashed with bcrypt
INSERT INTO users (user_type, email, password_hash, full_name, phone, address_line1, city, state, pincode, is_verified, is_active) VALUES
('farmer', 'rajesh.kumar@example.com', '$2a$10$rZ8qNqZ7YxEZxKjZ8qNqZOqZ8qNqZ7YxEZxKjZ8qNqZOqZ8qNqZ7Y', 'Rajesh Kumar', '9876543210', 'Village Rampur', 'Meerut', 'Uttar Pradesh', '250001', TRUE, TRUE),
('farmer', 'priya.sharma@example.com', '$2a$10$rZ8qNqZ7YxEZxKjZ8qNqZOqZ8qNqZ7YxEZxKjZ8qNqZOqZ8qNqZ7Y', 'Priya Sharma', '9876543211', 'Khasra No. 123', 'Jaipur', 'Rajasthan', '302001', TRUE, TRUE),
('farmer', 'suresh.patel@example.com', '$2a$10$rZ8qNqZ7YxEZxKjZ8qNqZOqZ8qNqZ7YxEZxKjZ8qNqZOqZ8qNqZ7Y', 'Suresh Patel', '9876543212', 'Farm House Road', 'Ahmedabad', 'Gujarat', '380001', TRUE, TRUE);

-- Insert Sample Users (Retailers)
INSERT INTO users (user_type, email, password_hash, full_name, phone, address_line1, city, state, pincode, is_verified, is_active) VALUES
('retailer', 'fresh.mart@example.com', '$2a$10$rZ8qNqZ7YxEZxKjZ8qNqZOqZ8qNqZ7YxEZxKjZ8qNqZOqZ8qNqZ7Y', 'Amit Verma', '9876543220', 'Shop No. 45, Market Road', 'Delhi', 'Delhi', '110001', TRUE, TRUE),
('retailer', 'green.grocery@example.com', '$2a$10$rZ8qNqZ7YxEZxKjZ8qNqZOqZ8qNqZ7YxEZxKjZ8qNqZOqZ8qNqZ7Y', 'Sneha Reddy', '9876543221', 'MG Road', 'Bangalore', 'Karnataka', '560001', TRUE, TRUE);

-- Insert Farmer Profiles
INSERT INTO farmer_profiles (user_id, farm_name, farm_size_acres, farm_type, farming_experience_years) VALUES
(1, 'Kumar Organic Farm', 15.5, 'organic', 20),
(2, 'Sharma Agro', 25.0, 'conventional', 15),
(3, 'Patel Farms', 40.0, 'mixed', 25);

-- Insert Retailer Profiles
INSERT INTO retailer_profiles (user_id, shop_name, shop_type, offers_home_delivery, delivery_radius_km) VALUES
(4, 'Fresh Mart', 'supermarket', TRUE, 10.0),
(5, 'Green Grocery Store', 'grocery', TRUE, 5.0);

-- Insert Sample Crops
INSERT INTO crops (farmer_id, category_id, crop_name, crop_variety, crop_type, quantity_available, unit, price_per_unit, quality_grade, is_organic, harvest_date, description, status) VALUES
(1, 1, 'Tomato', 'Hybrid', 'vegetable', 500.00, 'kg', 35.00, 'A+', TRUE, '2024-12-01', 'Fresh organic tomatoes, pesticide-free', 'available'),
(1, 1, 'Potato', 'Desi', 'vegetable', 1000.00, 'kg', 25.00, 'A', TRUE, '2024-11-25', 'Organic potatoes from our farm', 'available'),
(2, 2, 'Mango', 'Alphonso', 'fruit', 300.00, 'kg', 150.00, 'A+', FALSE, '2024-06-15', 'Premium Alphonso mangoes', 'available'),
(3, 3, 'Wheat', 'Sharbati', 'grain', 5000.00, 'quintal', 2500.00, 'A', FALSE, '2024-04-10', 'High quality wheat grains', 'available');

-- Insert Sample Market Prices
INSERT INTO market_prices (crop_name, crop_variety, market_name, city, state, min_price, max_price, modal_price, unit, arrivals_quantity, price_date, trend) VALUES
('Tomato', 'Hybrid', 'Azadpur Mandi', 'Delhi', 'Delhi', 30.00, 45.00, 38.00, 'kg', 5000.00, CURDATE(), 'up'),
('Potato', 'Desi', 'Azadpur Mandi', 'Delhi', 'Delhi', 20.00, 30.00, 25.00, 'kg', 8000.00, CURDATE(), 'stable'),
('Onion', 'Red', 'Lasalgaon Market', 'Nashik', 'Maharashtra', 25.00, 35.00, 30.00, 'kg', 10000.00, CURDATE(), 'down'),
('Wheat', 'Sharbati', 'Kota Mandi', 'Kota', 'Rajasthan', 2400.00, 2600.00, 2500.00, 'quintal', 2000.00, CURDATE(), 'stable');

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

DELIMITER //

-- Procedure: Register New User
CREATE PROCEDURE sp_register_user(
    IN p_user_type VARCHAR(20),
    IN p_email VARCHAR(255),
    IN p_password_hash VARCHAR(255),
    IN p_full_name VARCHAR(255),
    IN p_phone VARCHAR(20)
)
BEGIN
    DECLARE v_user_id BIGINT;

    -- Insert user
    INSERT INTO users (user_type, email, password_hash, full_name, phone)
    VALUES (p_user_type, p_email, p_password_hash, p_full_name, p_phone);

    SET v_user_id = LAST_INSERT_ID();

    -- Create profile based on user type
    IF p_user_type = 'farmer' THEN
        INSERT INTO farmer_profiles (user_id) VALUES (v_user_id);
    ELSEIF p_user_type = 'retailer' THEN
        INSERT INTO retailer_profiles (user_id, shop_name) VALUES (v_user_id, 'My Shop');
    END IF;

    SELECT v_user_id as user_id;
END //

-- Procedure: Update Crop Statistics
CREATE PROCEDURE sp_update_crop_stats(IN p_crop_id BIGINT)
BEGIN
    UPDATE crops c
    SET c.status = CASE
        WHEN c.quantity_available <= 0 THEN 'sold'
        WHEN c.expected_harvest_date < CURDATE() THEN 'expired'
        ELSE c.status
    END
    WHERE c.crop_id = p_crop_id;
END //

DELIMITER ;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

DELIMITER //

-- Trigger: Update farmer stats after crop insert
CREATE TRIGGER trg_after_crop_insert
AFTER INSERT ON crops
FOR EACH ROW
BEGIN
    UPDATE farmer_profiles
    SET total_crops_listed = total_crops_listed + 1
    WHERE user_id = NEW.farmer_id;
END //

-- Trigger: Update retailer stats after product insert
CREATE TRIGGER trg_after_product_insert
AFTER INSERT ON products
FOR EACH ROW
BEGIN
    UPDATE retailer_profiles
    SET total_products_listed = total_products_listed + 1
    WHERE user_id = NEW.retailer_id;
END //

-- Trigger: Update order total before insert
CREATE TRIGGER trg_before_order_insert
BEFORE INSERT ON orders
FOR EACH ROW
BEGIN
    SET NEW.total_amount = NEW.subtotal - NEW.discount_amount + NEW.delivery_charges + NEW.tax_amount;
END //

DELIMITER ;

-- ============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Additional composite indexes for common queries
CREATE INDEX idx_crops_farmer_status ON crops(farmer_id, status);
CREATE INDEX idx_products_retailer_status ON products(retailer_id, status);
CREATE INDEX idx_orders_retailer_status ON orders(retailer_id, order_status);
CREATE INDEX idx_payments_status_date ON payments(payment_status, payment_date);
CREATE INDEX idx_market_prices_crop_date ON market_prices(crop_name, price_date DESC);

-- ============================================================================
-- GRANT PERMISSIONS (Adjust as needed)
-- ============================================================================

-- Create application user
-- CREATE USER 'grassroots_app'@'localhost' IDENTIFIED BY 'your_secure_password';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON grassroots_db.* TO 'grassroots_app'@'localhost';
-- FLUSH PRIVILEGES;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

