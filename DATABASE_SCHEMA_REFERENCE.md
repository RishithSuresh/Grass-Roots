# 📊 GrassRoots Database Schema Reference

## 🗄️ Database Overview

**Database Name:** `grassroots_db`  
**Total Tables:** 17  
**Character Set:** utf8mb4  
**Collation:** utf8mb4_unicode_ci  
**Engine:** InnoDB

---

## 📋 Table Structure

### 1. **users** (Main user table)
Stores all users (farmers and retailers)

| Column | Type | Description |
|--------|------|-------------|
| user_id | BIGINT (PK) | Unique user identifier |
| user_type | ENUM | 'farmer' or 'retailer' |
| email | VARCHAR(255) | Unique email address |
| password_hash | VARCHAR(255) | Bcrypt hashed password |
| full_name | VARCHAR(255) | User's full name |
| phone | VARCHAR(20) | Contact number |
| address_line1/2 | VARCHAR(255) | Address details |
| city, state, pincode | VARCHAR | Location details |
| latitude, longitude | DECIMAL | GPS coordinates |
| is_verified | BOOLEAN | Account verification status |
| is_active | BOOLEAN | Account active status |
| created_at, updated_at | TIMESTAMP | Audit timestamps |

**Indexes:** user_type, email, phone, city+state, created_at

---

### 2. **farmer_profiles** (Farmer-specific data)
Extended profile for farmers

| Column | Type | Description |
|--------|------|-------------|
| farmer_profile_id | BIGINT (PK) | Profile ID |
| user_id | BIGINT (FK) | References users.user_id |
| farm_name | VARCHAR(255) | Name of the farm |
| farm_size_acres | DECIMAL(10,2) | Farm size |
| farm_type | ENUM | 'organic', 'conventional', 'mixed' |
| farming_experience_years | INT | Years of experience |
| bank_account_number | VARCHAR(50) | Bank details |
| bank_ifsc_code | VARCHAR(20) | IFSC code |
| upi_id | VARCHAR(100) | UPI ID for payments |
| total_crops_listed | INT | Count of crops |
| total_sales | DECIMAL(15,2) | Total sales amount |
| average_rating | DECIMAL(3,2) | Average rating (0-5) |

---

### 3. **retailer_profiles** (Retailer-specific data)
Extended profile for retailers

| Column | Type | Description |
|--------|------|-------------|
| retailer_profile_id | BIGINT (PK) | Profile ID |
| user_id | BIGINT (FK) | References users.user_id |
| shop_name | VARCHAR(255) | Shop name |
| shop_type | ENUM | 'grocery', 'supermarket', 'wholesale', etc. |
| gst_number | VARCHAR(20) | GST registration |
| business_license_number | VARCHAR(100) | License number |
| opening_time, closing_time | TIME | Operating hours |
| offers_home_delivery | BOOLEAN | Delivery service |
| delivery_radius_km | DECIMAL(5,2) | Delivery range |
| total_products_listed | INT | Product count |
| total_purchases | DECIMAL(15,2) | Total purchases |

---

### 4. **crop_categories** (Master data)
Crop category master table

| Column | Type | Description |
|--------|------|-------------|
| category_id | INT (PK) | Category ID |
| category_name | VARCHAR(100) | Category name (unique) |
| category_description | TEXT | Description |
| is_active | BOOLEAN | Active status |

**Sample Data:** Vegetables, Fruits, Grains, Pulses, Spices, Oilseeds

---

### 5. **crops** (Farmer's crop listings)
All crop listings by farmers

| Column | Type | Description |
|--------|------|-------------|
| crop_id | BIGINT (PK) | Crop ID |
| farmer_id | BIGINT (FK) | References users.user_id |
| category_id | INT (FK) | References crop_categories |
| crop_name | VARCHAR(255) | Crop name |
| crop_variety | VARCHAR(255) | Variety/cultivar |
| crop_type | ENUM | 'vegetable', 'fruit', 'grain', etc. |
| quantity_available | DECIMAL(10,2) | Available quantity |
| unit | ENUM | 'kg', 'quintal', 'ton', etc. |
| price_per_unit | DECIMAL(10,2) | Price |
| quality_grade | ENUM | 'A+', 'A', 'B', 'C' |
| is_organic | BOOLEAN | Organic certification |
| harvest_date | DATE | Harvest date |
| description | TEXT | Crop description |
| image_url_1/2/3 | VARCHAR(500) | Image URLs |
| qr_code_data | TEXT | QR code JSON data |
| blockchain_hash | VARCHAR(255) | Blockchain reference |
| status | ENUM | 'available', 'sold', 'reserved', 'expired' |

**Indexes:** farmer_id, crop_type, status, is_organic, harvest_date  
**Full-text:** crop_name, crop_variety, description

---

### 6. **market_prices** (Real-time market data)
Market price information

| Column | Type | Description |
|--------|------|-------------|
| price_id | BIGINT (PK) | Price entry ID |
| crop_name | VARCHAR(255) | Crop name |
| market_name | VARCHAR(255) | Market/mandi name |
| city, state | VARCHAR(100) | Location |
| min_price, max_price | DECIMAL(10,2) | Price range |
| modal_price | DECIMAL(10,2) | Most common price |
| unit | ENUM | Price unit |
| arrivals_quantity | DECIMAL(10,2) | Market arrivals |
| price_date | DATE | Price date |
| trend | ENUM | 'up', 'down', 'stable' |

**Unique Key:** crop_name + market_name + price_date

---

### 7. **products** (Retailer's product catalog)
Products listed by retailers

| Column | Type | Description |
|--------|------|-------------|
| product_id | BIGINT (PK) | Product ID |
| retailer_id | BIGINT (FK) | References users.user_id |
| crop_id | BIGINT (FK) | Source crop (if from platform) |
| product_name | VARCHAR(255) | Product name |
| quantity_in_stock | DECIMAL(10,2) | Stock quantity |
| selling_price | DECIMAL(10,2) | Selling price |
| mrp | DECIMAL(10,2) | Maximum retail price |
| cost_price | DECIMAL(10,2) | Purchase price |
| discount_percentage | DECIMAL(5,2) | Discount % |
| source_type | ENUM | 'platform', 'external', 'own_production' |
| barcode, sku | VARCHAR(100) | Product codes |
| scanned_qr_data | TEXT | QR data from farmer |
| status | ENUM | 'in_stock', 'out_of_stock', 'discontinued' |

---

### 8. **orders** (Customer orders)
Orders placed with retailers

| Column | Type | Description |
|--------|------|-------------|
| order_id | BIGINT (PK) | Order ID |
| retailer_id | BIGINT (FK) | References users.user_id |
| order_number | VARCHAR(50) | Unique order number |
| customer_name | VARCHAR(255) | Customer name |
| customer_phone | VARCHAR(20) | Contact |
| delivery_address | VARCHAR | Full address |
| subtotal | DECIMAL(10,2) | Subtotal amount |
| discount_amount | DECIMAL(10,2) | Discount |
| delivery_charges | DECIMAL(10,2) | Delivery fee |
| tax_amount | DECIMAL(10,2) | Tax |
| total_amount | DECIMAL(10,2) | Final total |
| payment_method | ENUM | Payment type |
| payment_status | ENUM | 'pending', 'paid', 'failed', 'refunded' |
| order_status | ENUM | Order lifecycle status |
| delivery_type | ENUM | 'home_delivery', 'store_pickup' |

---

### 9. **order_items** (Order line items)
Individual items in each order

| Column | Type | Description |
|--------|------|-------------|
| order_item_id | BIGINT (PK) | Item ID |
| order_id | BIGINT (FK) | References orders.order_id |
| product_id | BIGINT (FK) | References products.product_id |
| product_name | VARCHAR(255) | Product snapshot |
| quantity | DECIMAL(10,2) | Quantity ordered |
| unit_price | DECIMAL(10,2) | Price per unit |
| total_price | DECIMAL(10,2) | Line total |

---

### 10. **payments** (Payment transactions)
All payment records

| Column | Type | Description |
|--------|------|-------------|
| payment_id | BIGINT (PK) | Payment ID |
| order_id | BIGINT (FK) | Related order |
| payer_type, payer_id | VARCHAR/BIGINT | Who paid |
| payee_type, payee_id | VARCHAR/BIGINT | Who received |
| payment_type | ENUM | Transaction type |
| payment_method | ENUM | Payment method |
| amount | DECIMAL(15,2) | Amount |
| transaction_id | VARCHAR(255) | Unique transaction ID |
| payment_gateway | VARCHAR(100) | Gateway name |
| payment_status | ENUM | Status |
| blockchain_hash | VARCHAR(255) | Blockchain reference |

---

### 11-17. Additional Tables

**11. transactions** - Direct farmer-retailer transactions  
**12. qr_codes** - QR code generation and tracking  
**13. reviews** - Ratings and reviews  
**14. notifications** - User notifications  
**15. price_alerts** - Price alert configurations  
**16. activity_logs** - Audit trail  
**17. blockchain_records** - Blockchain transaction tracking

---

## 🔍 Database Views

1. **vw_farmer_dashboard** - Farmer summary statistics
2. **vw_retailer_dashboard** - Retailer summary statistics
3. **vw_market_price_trends** - 30-day price trends
4. **vw_active_crops** - Active crop listings with farmer details

---

## ⚡ Stored Procedures

1. **sp_register_user** - Register new user with profile
2. **sp_update_crop_stats** - Update crop statistics

---

## 🔔 Triggers

1. **trg_after_crop_insert** - Update farmer stats
2. **trg_after_product_insert** - Update retailer stats
3. **trg_before_order_insert** - Calculate order total

---

**Total Schema Size:** ~980 lines of SQL  
**Estimated Database Size:** 50-100 MB (with sample data)

