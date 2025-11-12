# GrassRoots SQL Database Schema Documentation

## Overview

This is a complete relational SQL database schema for the GrassRoots platform, designed for:
- Farmer registration and crop management
- Retailer/shopkeeper inventory and orders
- QR code generation and tracking
- Payment processing and invoicing
- Notifications and messaging
- Market price information
- Analytics and audit trails

## Database Setup

### Create Database
```sql
CREATE DATABASE grassroots_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE grassroots_db;
```

### Then Run schema.sql
Import the complete schema from `schema.sql` file.

---

## Table Structure Reference

### 1. **USERS** Table
Core authentication and user management for all user types.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| user_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Login email address |
| password_hash | VARCHAR(255) | NOT NULL | Hashed password (use bcrypt) |
| full_name | VARCHAR(255) | NOT NULL | User's full name |
| phone_number | VARCHAR(15) | | Optional phone contact |
| user_type | ENUM | NOT NULL | 'farmer', 'retailer', 'admin' |
| profile_picture_url | VARCHAR(500) | | URL to profile image |
| is_active | BOOLEAN | DEFAULT TRUE | Account status |
| created_at | TIMESTAMP | DEFAULT NOW | Registration date |
| updated_at | TIMESTAMP | AUTO UPDATE | Last modification |
| last_login | TIMESTAMP | | Track user activity |

**Indexes**: email, user_type, is_active

**Relationships**:
- ← farmer_profiles.user_id
- ← retailer_profiles.user_id
- ← notifications.user_id
- ← messages (sender/receiver)

---

### 2. **FARMER_PROFILES** Table
Extended farmer-specific profile information.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| farmer_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique farmer identifier |
| user_id | INT | FOREIGN KEY (users) | Reference to user account |
| farm_name | VARCHAR(255) | | Name of the farm |
| farm_location | VARCHAR(255) | | Farm's location/address |
| farm_area_acres | DECIMAL(8,2) | | Total farm size |
| years_of_experience | INT | | Farmer's experience |
| farming_methods | VARCHAR(255) | | Organic, conventional, mixed |
| certifications | TEXT | | Organic cert, quality certs |
| bank_account_number | VARCHAR(50) | | For payments |
| bank_name | VARCHAR(255) | | Bank details |
| ifsc_code | VARCHAR(20) | | IFSC code for transfers |
| government_id_number | VARCHAR(100) | | ID proof number |
| government_id_type | ENUM | | Aadhar, PAN, Voter_ID, License |
| bio | TEXT | | Farmer's bio/description |
| created_at | TIMESTAMP | DEFAULT NOW | Profile creation |
| updated_at | TIMESTAMP | AUTO UPDATE | Last update |

**Relationships**:
- crops.farmer_id
- qr_codes.farmer_id
- retailer_products.supplier_farmer_id
- retailer_orders.farmer_id
- payments.farmer_id
- farmer_activity_logs.farmer_id
- favorites.farmer_id

---

### 3. **RETAILER_PROFILES** Table
Extended retailer/shopkeeper profile information.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| retailer_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique retailer identifier |
| user_id | INT | FOREIGN KEY (users) | Reference to user account |
| shop_name | VARCHAR(255) | NOT NULL | Name of the shop |
| shop_location | VARCHAR(255) | | Shop's address |
| business_type | ENUM | NOT NULL | Wholesale/Retail/Distributor |
| shop_phone | VARCHAR(15) | | Shop contact number |
| shop_email | VARCHAR(255) | | Shop email address |
| registration_number | VARCHAR(100) | | GST/License number |
| registration_type | ENUM | | GST, Shop_License, Trade_License |
| owner_name | VARCHAR(255) | | Shop owner name |
| owner_id_type | ENUM | | Aadhar, PAN, etc. |
| owner_id_number | VARCHAR(100) | | ID number |
| shop_image_url | VARCHAR(500) | | Shop photo |
| bank_account_number | VARCHAR(50) | | For payments |
| bank_name | VARCHAR(255) | | Bank details |
| ifsc_code | VARCHAR(20) | | IFSC code |
| bio | TEXT | | Shop description |
| created_at | TIMESTAMP | DEFAULT NOW | Profile creation |
| updated_at | TIMESTAMP | AUTO UPDATE | Last update |

**Relationships**:
- retailer_products.retailer_id
- retailer_orders.retailer_id
- payments.retailer_id
- retailer_activity_logs.retailer_id

---

### 4. **CROPS** Table
Farmer's crop information and management.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| crop_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique crop identifier |
| farmer_id | INT | FOREIGN KEY (farmer_profiles) | Reference to farmer |
| crop_name | VARCHAR(255) | NOT NULL | Custom crop name |
| crop_type | ENUM | NOT NULL | Rice, Wheat, Maize, Cotton, etc. |
| planting_date | DATE | NOT NULL | Date crop was planted |
| expected_harvest_date | DATE | | Estimated harvest date |
| area_acres | DECIMAL(8,2) | NOT NULL | Area cultivated |
| expected_yield_quintals | DECIMAL(10,2) | | Expected yield amount |
| fertilizer_used | TEXT | | Types and amounts |
| pesticides_used | TEXT | | Types and application methods |
| irrigation_method | VARCHAR(255) | | Drip, flood, spray, etc. |
| soil_type | VARCHAR(100) | | Type of soil |
| seed_variety | VARCHAR(255) | | Specific seed variety used |
| notes | TEXT | | Additional notes |
| status | ENUM | DEFAULT 'Planning' | Planning/Growing/Ready/Harvested |
| created_at | TIMESTAMP | DEFAULT NOW | Record creation |
| updated_at | TIMESTAMP | AUTO UPDATE | Last update |

**Indexes**: farmer_id, crop_type, status

**Relationships**:
- qr_codes.crop_id
- farmer_activity_logs (referenced by entity_id)

---

### 5. **QR_CODES** Table
QR code records with agricultural details.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| qr_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique QR identifier |
| crop_id | INT | FOREIGN KEY (crops) | Reference to crop |
| farmer_id | INT | FOREIGN KEY (farmer_profiles) | Reference to farmer |
| qr_string | VARCHAR(500) | UNIQUE, NOT NULL | Encoded QR data |
| qr_image_base64 | LONGTEXT | | Base64 encoded PNG |
| qr_image_url | VARCHAR(500) | | URL to QR image |
| product_name | VARCHAR(255) | NOT NULL | Display name |
| crop_type | VARCHAR(100) | | Crop type from crop info |
| quality_grade | ENUM | NOT NULL | Premium/Good/Standard/Economy |
| harvest_date | DATE | | Harvest date |
| farm_location | VARCHAR(255) | | Farm location |
| fertilizer_used | TEXT | | Fertilizers used details |
| pesticides_used | TEXT | | Pesticides used details |
| batch_number | VARCHAR(100) | | Batch/lot identifier |
| price_per_unit | VARCHAR(50) | | Price in local currency |
| additional_notes | TEXT | | Extra information |
| scan_count | INT | DEFAULT 0 | Total scans |
| last_scanned_at | TIMESTAMP | | Last scan timestamp |
| created_at | TIMESTAMP | DEFAULT NOW | QR creation date |
| updated_at | TIMESTAMP | AUTO UPDATE | Last update |

**Indexes**: farmer_id, crop_id, batch_number, scan_count

**Relationships**:
- qr_scan_logs.qr_id
- farmer_activity_logs (referenced by entity_id)

---

### 6. **RETAILER_PRODUCTS** Table
Products in retailer's inventory.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| product_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique product ID |
| retailer_id | INT | FOREIGN KEY (retailer_profiles) | Reference to retailer |
| product_name | VARCHAR(255) | NOT NULL | Product name |
| product_description | TEXT | | Detailed description |
| category | VARCHAR(100) | | Product category |
| unit_price | DECIMAL(10,2) | NOT NULL | Price per unit |
| quantity_in_stock | INT | DEFAULT 0 | Current stock |
| unit_of_measurement | ENUM | NOT NULL | kg/liter/piece/dozen/gram |
| supplier_farmer_id | INT | FOREIGN KEY (farmer_profiles) | Reference to supplier farmer |
| reorder_level | INT | DEFAULT 10 | Minimum stock threshold |
| product_image_url | VARCHAR(500) | | Product image |
| is_organic | BOOLEAN | DEFAULT FALSE | Organic certification |
| expiry_date | DATE | | Product expiry date |
| created_at | TIMESTAMP | DEFAULT NOW | Record creation |
| updated_at | TIMESTAMP | AUTO UPDATE | Last update |

**Indexes**: retailer_id, category, quantity_in_stock

**Relationships**:
- retailer_orders.product_id
- ratings_reviews.product_id
- favorites.product_id
- retailer_activity_logs (referenced by entity_id)

---

### 7. **RETAILER_ORDERS** Table
Orders placed by or for retailers.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| order_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique order ID |
| retailer_id | INT | FOREIGN KEY (retailer_profiles) | Reference to retailer |
| product_id | INT | FOREIGN KEY (retailer_products) | Reference to product |
| farmer_id | INT | FOREIGN KEY (farmer_profiles) | Supplier farmer |
| quantity_ordered | INT | NOT NULL | Order quantity |
| unit_price | DECIMAL(10,2) | NOT NULL | Price per unit |
| total_amount | DECIMAL(10,2) | NOT NULL | Order total |
| order_status | ENUM | DEFAULT 'Pending' | Pending/Confirmed/Shipped/Delivered |
| delivery_date | DATE | | Expected/actual delivery date |
| notes | TEXT | | Order notes |
| created_at | TIMESTAMP | DEFAULT NOW | Order date |
| updated_at | TIMESTAMP | AUTO UPDATE | Last update |

**Indexes**: retailer_id, order_status, created_at

**Relationships**:
- payments.order_id
- retailer_activity_logs (referenced by entity_id)

---

### 8. **PAYMENTS** Table
Payment records and invoicing.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| payment_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique payment ID |
| order_id | INT | FOREIGN KEY (retailer_orders) | Associated order |
| retailer_id | INT | FOREIGN KEY (retailer_profiles) | Payer retailer |
| farmer_id | INT | FOREIGN KEY (farmer_profiles) | Payee farmer |
| payment_amount | DECIMAL(10,2) | NOT NULL | Amount paid |
| payment_method | ENUM | NOT NULL | Cash/Bank/UPI/Card/Cheque |
| payment_status | ENUM | DEFAULT 'Pending' | Pending/Completed/Failed/Refunded |
| transaction_id | VARCHAR(100) | | Payment gateway transaction ID |
| invoice_number | VARCHAR(50) | | Invoice reference number |
| payment_date | TIMESTAMP | DEFAULT NOW | Payment date/time |
| notes | TEXT | | Payment notes |
| created_at | TIMESTAMP | DEFAULT NOW | Record creation |
| updated_at | TIMESTAMP | AUTO UPDATE | Last update |

**Indexes**: retailer_id, payment_status, payment_date

**Relationships**: Referenced in farmer/retailer revenue views

---

### 9. **NOTIFICATIONS** Table
User notifications and alerts.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| notification_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique notification ID |
| user_id | INT | FOREIGN KEY (users) | Recipient user |
| notification_type | ENUM | NOT NULL | Order/Payment/Crop/Price/QR_Scan |
| title | VARCHAR(255) | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification message |
| related_entity_type | VARCHAR(50) | | Type of related entity |
| related_entity_id | INT | | ID of related entity |
| is_read | BOOLEAN | DEFAULT FALSE | Read status |
| created_at | TIMESTAMP | DEFAULT NOW | Creation date |
| updated_at | TIMESTAMP | AUTO UPDATE | Last update |

**Indexes**: user_id, is_read, created_at

**Common Types**:
- Order: "New order from Retailer X"
- Payment: "Payment received from Retailer X"
- Crop_Update: "Crop ready for harvest"
- Market_Price: "Price for Rice increased"
- QR_Scan: "Your product QR scanned"
- System: "System maintenance notice"
- General: "General announcements"

---

### 10. **MARKET_PRICES** Table
Market price information and trends.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| price_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique price record ID |
| crop_type | VARCHAR(100) | NOT NULL | Type of crop |
| market_location | VARCHAR(255) | NOT NULL | Market location |
| price_per_unit | DECIMAL(10,2) | NOT NULL | Market price |
| unit_type | ENUM | NOT NULL | kg/quintal/bag/dozen |
| quality_grade | ENUM | | Premium/Good/Standard/Economy |
| price_date | DATE | NOT NULL | Date of price quote |
| trend | ENUM | | Up/Down/Stable |
| created_at | TIMESTAMP | DEFAULT NOW | Record creation |
| updated_at | TIMESTAMP | AUTO UPDATE | Last update |

**Indexes**: crop_type, market_location, price_date

---

### 11. **ACTIVITY LOGS** Tables
Two separate tables for farmer and retailer activity tracking.

**FARMER_ACTIVITY_LOGS**:
- farmer_id, activity_type, entity_type, entity_id, description, created_at
- Activity types: Crop_Added, Crop_Updated, QR_Generated, Sale_Made, Payment_Received, etc.

**RETAILER_ACTIVITY_LOGS**:
- retailer_id, activity_type, entity_type, entity_id, description, created_at
- Activity types: Product_Added, Order_Placed, Payment_Made, Inventory_Updated, etc.

---

### 12. **QR_SCAN_LOGS** Table
Detailed log of each QR code scan for analytics.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| scan_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique scan record ID |
| qr_id | INT | FOREIGN KEY (qr_codes) | Reference to QR code |
| scan_timestamp | TIMESTAMP | DEFAULT NOW | When QR was scanned |
| scanner_location | VARCHAR(255) | | GPS or city location |
| scanner_device | VARCHAR(255) | | Device info (Mobile/Desktop) |
| scanner_ip_address | VARCHAR(45) | | IP address of scanner |
| created_at | TIMESTAMP | DEFAULT NOW | Record creation |

**Index**: qr_id, scan_timestamp

---

### 13. **MESSAGES** Table
Direct messages between farmers and retailers.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| message_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique message ID |
| sender_id | INT | FOREIGN KEY (users) | Message sender |
| receiver_id | INT | FOREIGN KEY (users) | Message recipient |
| message_subject | VARCHAR(255) | | Message subject |
| message_body | TEXT | NOT NULL | Full message content |
| message_type | ENUM | DEFAULT 'General' | Inquiry/Negotiation/Confirmation |
| is_read | BOOLEAN | DEFAULT FALSE | Read status |
| created_at | TIMESTAMP | DEFAULT NOW | Send date/time |
| updated_at | TIMESTAMP | AUTO UPDATE | Last update |

**Indexes**: sender_id, receiver_id, is_read, created_at

---

### 14. **RATINGS_REVIEWS** Table
Reviews and ratings for farmers and products.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| review_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique review ID |
| reviewer_user_id | INT | FOREIGN KEY (users) | Who wrote review |
| reviewed_user_id | INT | FOREIGN KEY (users) | Who is being reviewed |
| product_id | INT | FOREIGN KEY (retailer_products) | Product being reviewed (optional) |
| rating | INT | CHECK 1-5 | Star rating (1-5) |
| review_title | VARCHAR(255) | | Review headline |
| review_text | TEXT | | Review content |
| review_date | TIMESTAMP | DEFAULT NOW | Review date |
| helpful_count | INT | DEFAULT 0 | Helpful votes |
| created_at | TIMESTAMP | DEFAULT NOW | Record creation |
| updated_at | TIMESTAMP | AUTO UPDATE | Last update |

**Indexes**: reviewed_user_id, rating, review_date

---

### 15. **FAVORITES** Table
User's favorite farmers and products (wishlist).

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| favorite_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique favorite ID |
| user_id | INT | FOREIGN KEY (users) | User who favorited |
| farmer_id | INT | FOREIGN KEY (farmer_profiles) | Favorite farmer (optional) |
| product_id | INT | FOREIGN KEY (retailer_products) | Favorite product (optional) |
| created_at | TIMESTAMP | DEFAULT NOW | Date added |

**Unique Constraint**: user_id + farmer_id + product_id

---

### 16. **ADMIN_AUDIT_LOGS** Table
Administrative actions and audit trail.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| audit_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique audit ID |
| admin_user_id | INT | FOREIGN KEY (users) | Admin performing action |
| action_type | VARCHAR(100) | NOT NULL | Type of action |
| entity_type | VARCHAR(50) | | Entity affected |
| entity_id | INT | | ID of entity |
| changes_made | TEXT | | Details of changes |
| ip_address | VARCHAR(45) | | Admin's IP address |
| created_at | TIMESTAMP | DEFAULT NOW | Action date/time |

**Indexes**: admin_user_id, created_at

---

## Database Views

### 1. **farmer_summary**
Aggregates farmer statistics including crops, QR codes, and scans.

### 2. **retailer_summary**
Aggregates retailer statistics including products, orders, and sales values.

### 3. **top_qr_codes**
Shows top 100 most scanned QR codes.

### 4. **recent_orders_view**
Shows recent orders with retailer and farmer details.

---

## Stored Procedures

### 1. **record_qr_scan()**
Records a QR code scan and updates metrics.
```sql
CALL record_qr_scan(qr_id, location, device, ip_address);
```

### 2. **get_farmer_revenue_summary()**
Returns revenue statistics for a farmer.
```sql
CALL get_farmer_revenue_summary(farmer_id);
```

### 3. **get_retailer_sales_summary()**
Returns sales statistics for a retailer.
```sql
CALL get_retailer_sales_summary(retailer_id);
```

---

## Key Design Features

### 1. **Data Integrity**
- Foreign key constraints ensure referential integrity
- CHECK constraints validate data ranges
- UNIQUE constraints prevent duplicates

### 2. **Performance**
- Strategic indexes on frequently queried columns
- Separate tables for farmer/retailer to reduce NULL values
- Indexed timestamps for range queries

### 3. **Scalability**
- AUTO_INCREMENT for primary keys
- Proper data type sizing (no oversized columns)
- Views for complex aggregations
- Activity logs for audit trail

### 4. **Security**
- Passwords stored as hashes (not plaintext)
- Audit logs track all changes
- IP logging for security monitoring
- Role-based table access via database users

### 5. **Maintainability**
- Consistent naming conventions
- Clear foreign key relationships
- Comprehensive documentation
- Organized by feature area

---

## Common Queries

### Get farmer with all crops
```sql
SELECT f.*, c.* 
FROM farmer_profiles f
LEFT JOIN crops c ON f.farmer_id = c.farmer_id
WHERE f.user_id = ?;
```

### Get retailer's inventory
```sql
SELECT p.*, f.farm_name
FROM retailer_products p
LEFT JOIN farmer_profiles f ON p.supplier_farmer_id = f.farmer_id
WHERE p.retailer_id = ?
ORDER BY p.quantity_in_stock;
```

### Get farmer's QR codes with scans
```sql
SELECT qr.*, COUNT(qs.scan_id) as scan_count
FROM qr_codes qr
LEFT JOIN qr_scan_logs qs ON qr.qr_id = qs.qr_id
WHERE qr.farmer_id = ?
GROUP BY qr.qr_id;
```

### Get user's recent notifications
```sql
SELECT * FROM notifications
WHERE user_id = ? AND is_read = FALSE
ORDER BY created_at DESC
LIMIT 20;
```

### Get pending orders for retailer
```sql
SELECT o.*, p.product_name, f.farm_name
FROM retailer_orders o
JOIN retailer_products p ON o.product_id = p.product_id
LEFT JOIN farmer_profiles f ON o.farmer_id = f.farmer_id
WHERE o.retailer_id = ? AND o.order_status IN ('Pending', 'Confirmed')
ORDER BY o.created_at DESC;
```

---

## Migration Notes

If migrating from MongoDB (localStorage):
1. Create users from farmer/retailer data
2. Import crops and QR codes with relationships
3. Map retailer products to product table
4. Convert notifications to SQL table
5. Create activity logs from history data

---

## Backup & Recovery

### Regular Backups
```bash
mysqldump -u root -p grassroots_db > grassroots_backup.sql
```

### Restore from Backup
```bash
mysql -u root -p grassroots_db < grassroots_backup.sql
```

---

## Performance Optimization Tips

1. **Index Maintenance**: Rebuild indexes regularly
2. **Query Optimization**: Use EXPLAIN to analyze queries
3. **Caching**: Cache frequent queries results
4. **Archiving**: Archive old activity logs
5. **Partitioning**: Partition large tables by date

---

**Last Updated**: November 2024
**Version**: 1.0.0
