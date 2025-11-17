-- init.sql
-- Expanded SQL schema and demo data for GrassRoots (MySQL)
-- Edit the database name below to match your environment or run 'CREATE DATABASE' separately.

-- Replace 'grassroots_db' with your DB_NAME if needed
CREATE DATABASE IF NOT EXISTS `grassroots_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `grassroots_db`;

-- -------------------------
-- Users & Profiles
-- -------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255),
  `role` ENUM('farmer','retailer','admin') DEFAULT 'farmer',
  `name` VARCHAR(255),
  `phone` VARCHAR(50),
  `is_active` TINYINT(1) DEFAULT 1,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `profiles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userId` INT NULL,
  `shopName` VARCHAR(255),
  `address` TEXT,
  `city` VARCHAR(100),
  `state` VARCHAR(100),
  `postalCode` VARCHAR(30),
  `country` VARCHAR(100),
  `phone` VARCHAR(50),
  `metadata` JSON NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_profile_user` (`userId`),
  CONSTRAINT `fk_profile_user` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------
-- Crops and QR codes
-- -------------------------
CREATE TABLE IF NOT EXISTS `crops` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `variety` VARCHAR(255),
  `plantedAt` DATE NULL,
  `harvestEstimate` DATE NULL,
  `area_acres` DECIMAL(10,3) DEFAULT NULL,
  `expected_yield_quintals` DECIMAL(10,3) DEFAULT NULL,
  `irrigation` VARCHAR(255) DEFAULT NULL,
  `fertilizers` TEXT,
  `pesticides` TEXT,
  `geo_location` VARCHAR(255) DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'growing',
  `farmer_email` VARCHAR(255) DEFAULT NULL,
  `notes` TEXT,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_crops_farmer` (`farmer_email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `qr_codes` (
  `id` VARCHAR(191) NOT NULL,
  `cropId` INT DEFAULT NULL,
  `productName` VARCHAR(255),
  `cropType` VARCHAR(255),
  `quality` VARCHAR(100),
  `harvestDate` DATE NULL,
  `farmLocation` VARCHAR(255),
  `fertilizerUsed` TEXT,
  `pesticidesUsed` TEXT,
  `batchNumber` VARCHAR(255),
  `price` DECIMAL(12,2) DEFAULT NULL,
  `farmerEmail` VARCHAR(255) DEFAULT NULL,
  `farmerName` VARCHAR(255) DEFAULT NULL,
  `generatedAt` DATETIME DEFAULT NULL,
  `canvasData` LONGTEXT,
  `metadata` JSON DEFAULT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_qr_crop` (`cropId`),
  KEY `idx_qr_farmer` (`farmerEmail`),
  CONSTRAINT `fk_qr_crop` FOREIGN KEY (`cropId`) REFERENCES `crops`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------
-- Products, Categories & Inventory
-- -------------------------
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_categories_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(191) NOT NULL,
  `qrId` VARCHAR(191) DEFAULT NULL,
  `categoryId` INT DEFAULT NULL,
  `retailerId` INT DEFAULT NULL,
  `name` VARCHAR(255) NOT NULL,
  `unit` VARCHAR(50) DEFAULT 'kg',
  `price` DECIMAL(12,2) DEFAULT 0.00,
  `stock` INT DEFAULT 0,
  `inventory_threshold` INT DEFAULT 0,
  `description` TEXT,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_product_qr` (`qrId`),
  KEY `fk_product_category` (`categoryId`),
  KEY `fk_product_retailer` (`retailerId`),
  CONSTRAINT `fk_product_qr` FOREIGN KEY (`qrId`) REFERENCES `qr_codes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_product_category` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_product_retailer` FOREIGN KEY (`retailerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `inventory_movements` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `productId` VARCHAR(191),
  `change_qty` INT NOT NULL,
  `reason` VARCHAR(255) DEFAULT NULL,
  `related_id` VARCHAR(255) DEFAULT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_inv_product` (`productId`),
  CONSTRAINT `fk_inv_product` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------
-- Orders, Order Items & Payments
-- -------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(191) NOT NULL,
  `retailerId` INT DEFAULT NULL,
  `total` DECIMAL(12,2) DEFAULT 0.00,
  `status` VARCHAR(50) DEFAULT 'Pending',
  `paid` TINYINT(1) DEFAULT 0,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_order_retailer` (`retailerId`),
  CONSTRAINT `fk_order_retailer` FOREIGN KEY (`retailerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `orderId` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) DEFAULT NULL,
  `name` VARCHAR(255),
  `unit_price` DECIMAL(12,2) DEFAULT 0.00,
  `quantity` INT DEFAULT 0,
  `subtotal` DECIMAL(12,2) GENERATED ALWAYS AS (`unit_price` * `quantity`) STORED,
  PRIMARY KEY (`id`),
  KEY `fk_item_order` (`orderId`),
  KEY `fk_item_product` (`productId`),
  CONSTRAINT `fk_item_order` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_item_product` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `payments` (
  `id` VARCHAR(191) NOT NULL,
  `orderId` VARCHAR(191) DEFAULT NULL,
  `amount` DECIMAL(12,2) DEFAULT 0.00,
  `method` VARCHAR(50) DEFAULT 'cash',
  `reference` VARCHAR(255) DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'pending',
  `paid_at` DATETIME DEFAULT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_payment_order` (`orderId`),
  CONSTRAINT `fk_payment_order` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------
-- Notifications, Price Checks, Audit
-- -------------------------
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userId` INT DEFAULT NULL,
  `type` VARCHAR(100),
  `message` TEXT,
  `read` TINYINT(1) DEFAULT 0,
  `metadata` JSON DEFAULT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_notif_user` (`userId`),
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `price_checks` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `productId` VARCHAR(191) DEFAULT NULL,
  `checked_by` VARCHAR(255) DEFAULT NULL,
  `price` DECIMAL(12,2) DEFAULT NULL,
  `source` VARCHAR(255) DEFAULT NULL,
  `checkedAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_price_product` (`productId`),
  CONSTRAINT `fk_price_product` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `entity` VARCHAR(100),
  `entity_id` VARCHAR(255),
  `action` VARCHAR(50),
  `payload` JSON DEFAULT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_entity` (`entity`, `entity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------
-- Indexes for common queries
-- -------------------------
-- MySQL does not support CREATE INDEX IF NOT EXISTS prior to newer versions.
-- Use INFORMATION_SCHEMA checks + prepared statements to create indexes only when missing.

-- idx_products_name
SET @cnt = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND INDEX_NAME = 'idx_products_name');
SET @sql = IF(@cnt = 0, 'CREATE INDEX idx_products_name ON products (name(100))', 'SELECT "idx_products_name_exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- idx_orders_status
SET @cnt = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND INDEX_NAME = 'idx_orders_status');
SET @sql = IF(@cnt = 0, 'CREATE INDEX idx_orders_status ON orders (status)', 'SELECT "idx_orders_status_exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- idx_qr_generated
SET @cnt = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'qr_codes' AND INDEX_NAME = 'idx_qr_generated');
SET @sql = IF(@cnt = 0, 'CREATE INDEX idx_qr_generated ON qr_codes (generatedAt)', 'SELECT "idx_qr_generated_exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- -------------------------
-- Demo data (multiple rows for a larger DB)
-- -------------------------
-- Demo users
INSERT INTO `users` (`email`,`password_hash`,`role`,`name`,`phone`)
SELECT * FROM (SELECT 'farmer@demo.test','farmerpass','farmer','Demo Farmer','+911234567890') AS tmp
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'farmer@demo.test') LIMIT 1;

INSERT INTO `users` (`email`,`password_hash`,`role`,`name`,`phone`)
SELECT * FROM (SELECT 'farmer2@demo.test','farmer2pass','farmer','Farmer Two','+919876543210') AS tmp
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'farmer2@demo.test') LIMIT 1;

INSERT INTO `users` (`email`,`password_hash`,`role`,`name`,`phone`)
SELECT * FROM (SELECT 'retailer@demo.test','retailerpass','retailer','Demo Retailer','+911112223334') AS tmp
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'retailer@demo.test') LIMIT 1;

-- Demo categories
INSERT INTO `categories` (`name`,`slug`) SELECT * FROM (SELECT 'Grains','grains') AS tmp WHERE NOT EXISTS (SELECT 1 FROM `categories` WHERE `slug`='grains') LIMIT 1;
INSERT INTO `categories` (`name`,`slug`) SELECT * FROM (SELECT 'Vegetables','vegetables') AS tmp WHERE NOT EXISTS (SELECT 1 FROM `categories` WHERE `slug`='vegetables') LIMIT 1;

-- Demo crops
INSERT INTO `crops` (`name`,`variety`,`area_acres`,`expected_yield_quintals`,`notes`,`farmer_email`) 
SELECT * FROM (SELECT 'Tomato','Cherry',1.5,2.5,'Demo cherry tomato crop','farmer@demo.test') AS tmp
WHERE NOT EXISTS (SELECT 1 FROM `crops` WHERE `name`='Tomato' AND `farmer_email`='farmer@demo.test') LIMIT 1;

INSERT INTO `crops` (`name`,`variety`,`area_acres`,`expected_yield_quintals`,`notes`,`farmer_email`) 
SELECT * FROM (SELECT 'Rice','Basmati',5.0,20.0,'Demo basmati paddy','farmer2@demo.test') AS tmp
WHERE NOT EXISTS (SELECT 1 FROM `crops` WHERE `name`='Rice' AND `farmer_email`='farmer2@demo.test') LIMIT 1;

-- Demo QR codes for those crops
INSERT INTO `qr_codes` (`id`,`cropId`,`productName`,`cropType`,`generatedAt`,`farmerEmail`,`farmerName`,`canvasData`)
SELECT 'QR-DEMO-1', c.id, 'Tomato (Cherry)','Tomato', NOW(), 'farmer@demo.test', 'Demo Farmer', '' FROM `crops` c
WHERE c.name='Tomato' AND c.farmer_email='farmer@demo.test' AND NOT EXISTS (SELECT 1 FROM `qr_codes` WHERE `id`='QR-DEMO-1') LIMIT 1;

INSERT INTO `qr_codes` (`id`,`cropId`,`productName`,`cropType`,`generatedAt`,`farmerEmail`,`farmerName`,`canvasData`)
SELECT 'QR-DEMO-2', c.id, 'Basmati Rice - Premium','Rice', NOW(), 'farmer2@demo.test', 'Farmer Two', '' FROM `crops` c
WHERE c.name='Rice' AND c.farmer_email='farmer2@demo.test' AND NOT EXISTS (SELECT 1 FROM `qr_codes` WHERE `id`='QR-DEMO-2') LIMIT 1;

-- Demo products using QR codes
INSERT INTO `products` (`id`,`qrId`,`categoryId`,`retailerId`,`name`,`unit`,`price`,`stock`,`description`)
SELECT * FROM (SELECT 'prod_tomato_demo','QR-DEMO-1', (SELECT id FROM categories WHERE slug='vegetables'), (SELECT id FROM users WHERE email='retailer@demo.test'),'Cherry Tomato Demo','kg',80.00,200,'Fresh cherry tomatoes (demo)') AS tmp
WHERE NOT EXISTS (SELECT 1 FROM `products` WHERE `id`='prod_tomato_demo') LIMIT 1;

INSERT INTO `products` (`id`,`qrId`,`categoryId`,`retailerId`,`name`,`unit`,`price`,`stock`,`description`)
SELECT * FROM (SELECT 'prod_basmati_demo','QR-DEMO-2', (SELECT id FROM categories WHERE slug='grains'), (SELECT id FROM users WHERE email='retailer@demo.test'),'Basmati Rice Demo','kg',140.00,500,'Premium basmati rice (demo)') AS tmp
WHERE NOT EXISTS (SELECT 1 FROM `products` WHERE `id`='prod_basmati_demo') LIMIT 1;

-- Demo order and items
INSERT INTO `orders` (`id`,`retailerId`,`total`,`status`,`paid`)
SELECT * FROM (SELECT 'o_demo_1', (SELECT id FROM users WHERE email='retailer@demo.test'), 240.00, 'Pending', 0) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM `orders` WHERE `id`='o_demo_1') LIMIT 1;

INSERT INTO `order_items` (`orderId`,`productId`,`name`,`unit_price`,`quantity`)
SELECT * FROM (
  SELECT 'o_demo_1','prod_tomato_demo','Cherry Tomato Demo',80.00,2
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM `order_items` WHERE `orderId`='o_demo_1' AND `productId`='prod_tomato_demo') LIMIT 1;

INSERT INTO `order_items` (`orderId`,`productId`,`name`,`unit_price`,`quantity`)
SELECT * FROM (
  SELECT 'o_demo_1','prod_basmati_demo','Basmati Rice Demo',40.00,1
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM `order_items` WHERE `orderId`='o_demo_1' AND `productId`='prod_basmati_demo') LIMIT 1;

-- Demo payment for order (pending)
INSERT INTO `payments` (`id`,`orderId`,`amount`,`method`,`status`)
SELECT * FROM (SELECT 'pay_demo_1','o_demo_1',240.00,'cash','pending') AS tmp
WHERE NOT EXISTS (SELECT 1 FROM `payments` WHERE `id`='pay_demo_1') LIMIT 1;

-- Demo notifications and price_checks
INSERT INTO `notifications` (`userId`,`type`,`message`,`metadata`) SELECT (SELECT id FROM users WHERE email='retailer@demo.test'), 'order', 'New demo order received', JSON_OBJECT('orderId','o_demo_1') WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE message LIKE 'New demo order received') LIMIT 1;

INSERT INTO `price_checks` (`productId`,`checked_by`,`price`,`source`) SELECT 'prod_tomato_demo','market_api',78.00,'local_market' WHERE NOT EXISTS (SELECT 1 FROM price_checks WHERE productId='prod_tomato_demo') LIMIT 1;

-- -------------------------
-- Cleanup / Defaults
-- -------------------------
-- Ensure strict mode doesn't error on generated column creation in some MySQL versions. If you have MySQL < 5.7, remove JSON columns and adjust types.

-- End of expanded schema
