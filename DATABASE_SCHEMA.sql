-- ============================================
-- GRASSROOTS PLATFORM - DATABASE SCHEMA
-- ============================================
-- This file contains all database tables and relationships
-- for the GrassRoots agricultural platform
-- ============================================

-- Users Table (for authentication)
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    user_type ENUM('farmer', 'retailer', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_user_type (user_type)
);

-- Farmers Profile Table
CREATE TABLE farmers (
    farmer_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    farm_location VARCHAR(255),
    farm_size_acres DECIMAL(10,2),
    farming_experience_years INT,
    preferred_language VARCHAR(50) DEFAULT 'English',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- Retailers/Shopkeepers Profile Table
CREATE TABLE retailers (
    retailer_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    shop_name VARCHAR(255) NOT NULL,
    shop_address TEXT,
    shop_location VARCHAR(255),
    business_license VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- Crop Types Master Table
CREATE TABLE crop_types (
    crop_type_id INT PRIMARY KEY AUTO_INCREMENT,
    crop_name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50),
    description TEXT,
    typical_season VARCHAR(50),
    INDEX idx_crop_name (crop_name)
);

-- Farmer Crops Table (Crop Information Page)
CREATE TABLE farmer_crops (
    crop_id INT PRIMARY KEY AUTO_INCREMENT,
    farmer_id INT NOT NULL,
    crop_type_id INT NOT NULL,
    planting_date DATE NOT NULL,
    area_acres DECIMAL(10,2) NOT NULL,
    expected_yield_quintals DECIMAL(10,2) NOT NULL,
    notes TEXT,
    status ENUM('planted', 'growing', 'ready', 'harvested') DEFAULT 'planted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES farmers(farmer_id) ON DELETE CASCADE,
    FOREIGN KEY (crop_type_id) REFERENCES crop_types(crop_type_id),
    INDEX idx_farmer_id (farmer_id),
    INDEX idx_status (status)
);

-- QR Codes Table (QR Generator Page)
CREATE TABLE qr_codes (
    qr_id INT PRIMARY KEY AUTO_INCREMENT,
    farmer_id INT NOT NULL,
    crop_id INT NOT NULL,
    qr_code_data TEXT NOT NULL,
    qr_code_image_url VARCHAR(500),
    batch_number VARCHAR(100) UNIQUE NOT NULL,
    quantity_kg DECIMAL(10,2) NOT NULL,
    harvest_date DATE NOT NULL,
    expiry_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES farmers(farmer_id) ON DELETE CASCADE,
    FOREIGN KEY (crop_id) REFERENCES farmer_crops(crop_id) ON DELETE CASCADE,
    INDEX idx_batch_number (batch_number),
    INDEX idx_farmer_id (farmer_id),
    INDEX idx_is_active (is_active)
);

-- Market Prices Table (Market Prices Page)
CREATE TABLE market_prices (
    price_id INT PRIMARY KEY AUTO_INCREMENT,
    crop_type_id INT NOT NULL,
    market_location VARCHAR(255) NOT NULL,
    price_per_quintal DECIMAL(10,2) NOT NULL,
    price_date DATE NOT NULL,
    source VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (crop_type_id) REFERENCES crop_types(crop_type_id),
    INDEX idx_crop_type (crop_type_id),
    INDEX idx_price_date (price_date),
    INDEX idx_market_location (market_location)
);

-- Products Table (Retailer Product Catalog)
CREATE TABLE products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    retailer_id INT NOT NULL,
    qr_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    price_per_kg DECIMAL(10,2) NOT NULL,
    available_quantity_kg DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (retailer_id) REFERENCES retailers(retailer_id) ON DELETE CASCADE,
    FOREIGN KEY (qr_id) REFERENCES qr_codes(qr_id),
    INDEX idx_retailer_id (retailer_id),
    INDEX idx_is_available (is_available)
);

-- Orders Table (Retailer Orders Page)
CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    retailer_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity_kg DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    order_status ENUM('pending', 'confirmed', 'delivered', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivery_date DATE,
    notes TEXT,
    FOREIGN KEY (retailer_id) REFERENCES retailers(retailer_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    INDEX idx_retailer_id (retailer_id),
    INDEX idx_order_status (order_status),
    INDEX idx_payment_status (payment_status)
);

-- Payments Table (Retailer Payments Page)
CREATE TABLE payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    retailer_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'card', 'upi', 'bank_transfer') NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(255) UNIQUE,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (retailer_id) REFERENCES retailers(retailer_id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_retailer_id (retailer_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_transaction_id (transaction_id)
);

-- Notifications Table
CREATE TABLE notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type ENUM('order', 'payment', 'system', 'alert') DEFAULT 'system',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- ============================================
-- SAMPLE DATA INSERTS
-- ============================================

-- Insert Crop Types
INSERT INTO crop_types (crop_name, category, description, typical_season) VALUES
('Rice', 'Cereal', 'Staple grain crop', 'Kharif'),
('Wheat', 'Cereal', 'Winter grain crop', 'Rabi'),
('Maize', 'Cereal', 'Corn crop', 'Kharif/Rabi'),
('Cotton', 'Cash Crop', 'Fiber crop', 'Kharif'),
('Sugarcane', 'Cash Crop', 'Sugar producing crop', 'Year-round'),
('Tomato', 'Vegetable', 'Fresh vegetable', 'Year-round'),
('Potato', 'Vegetable', 'Tuber vegetable', 'Rabi'),
('Onion', 'Vegetable', 'Bulb vegetable', 'Rabi'),
('Cabbage', 'Vegetable', 'Leafy vegetable', 'Rabi'),
('Carrot', 'Vegetable', 'Root vegetable', 'Rabi'),
('Beans', 'Vegetable', 'Legume vegetable', 'Kharif'),
('Chili', 'Spice', 'Hot pepper', 'Kharif'),
('Turmeric', 'Spice', 'Spice crop', 'Kharif'),
('Ginger', 'Spice', 'Rhizome spice', 'Kharif'),
('Banana', 'Fruit', 'Tropical fruit', 'Year-round'),
('Mango', 'Fruit', 'Summer fruit', 'Summer'),
('Papaya', 'Fruit', 'Tropical fruit', 'Year-round'),
('Grapes', 'Fruit', 'Vine fruit', 'Summer');

-- Insert Sample Market Prices
INSERT INTO market_prices (crop_type_id, market_location, price_per_quintal, price_date, source) VALUES
(1, 'Bangalore', 2500.00, CURDATE(), 'APMC'),
(1, 'Mysore', 2450.00, CURDATE(), 'APMC'),
(2, 'Bangalore', 2200.00, CURDATE(), 'APMC'),
(2, 'Hubli', 2150.00, CURDATE(), 'APMC'),
(3, 'Bangalore', 1800.00, CURDATE(), 'APMC'),
(6, 'Bangalore', 3500.00, CURDATE(), 'APMC'),
(7, 'Bangalore', 2000.00, CURDATE(), 'APMC'),
(8, 'Bangalore', 2800.00, CURDATE(), 'APMC');

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View: Farmer Dashboard Summary
CREATE VIEW farmer_dashboard_view AS
SELECT
    f.farmer_id,
    u.full_name,
    u.email,
    COUNT(DISTINCT fc.crop_id) as total_crops,
    COUNT(DISTINCT qr.qr_id) as total_qr_codes,
    SUM(fc.area_acres) as total_farm_area
FROM farmers f
JOIN users u ON f.user_id = u.user_id
LEFT JOIN farmer_crops fc ON f.farmer_id = fc.farmer_id
LEFT JOIN qr_codes qr ON f.farmer_id = qr.farmer_id
GROUP BY f.farmer_id, u.full_name, u.email;

-- View: Retailer Dashboard Summary
CREATE VIEW retailer_dashboard_view AS
SELECT
    r.retailer_id,
    u.full_name,
    r.shop_name,
    COUNT(DISTINCT p.product_id) as total_products,
    COUNT(DISTINCT o.order_id) as total_orders,
    SUM(CASE WHEN o.payment_status = 'paid' THEN o.total_amount ELSE 0 END) as total_revenue,
    SUM(CASE WHEN o.payment_status = 'unpaid' THEN o.total_amount ELSE 0 END) as pending_payments
FROM retailers r
JOIN users u ON r.user_id = u.user_id
LEFT JOIN products p ON r.retailer_id = p.retailer_id
LEFT JOIN orders o ON r.retailer_id = o.retailer_id
GROUP BY r.retailer_id, u.full_name, r.shop_name;

-- View: Product Details with QR Info
CREATE VIEW product_details_view AS
SELECT
    p.product_id,
    p.product_name,
    p.price_per_kg,
    p.available_quantity_kg,
    qr.batch_number,
    qr.harvest_date,
    ct.crop_name,
    u.full_name as farmer_name
FROM products p
JOIN qr_codes qr ON p.qr_id = qr.qr_id
JOIN farmer_crops fc ON qr.crop_id = fc.crop_id
JOIN crop_types ct ON fc.crop_type_id = ct.crop_type_id
JOIN farmers f ON qr.farmer_id = f.farmer_id
JOIN users u ON f.user_id = u.user_id;

-- ============================================
-- END OF SCHEMA
-- ============================================

