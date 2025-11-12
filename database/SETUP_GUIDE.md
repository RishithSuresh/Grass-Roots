# GrassRoots Database Quick Setup Guide

## Prerequisites
- MySQL 5.7+ or MySQL 8.0+
- MySQL Client or GUI tool (MySQL Workbench, DBeaver, phpMyAdmin)
- Basic SQL knowledge

## Installation

### Option 1: Windows
1. Download MySQL from https://dev.mysql.com/downloads/mysql/
2. Run installer, select Development Default Setup
3. Configure port (default 3306)
4. Set root password

### Option 2: macOS
```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

### Option 3: Linux (Ubuntu)
```bash
sudo apt-get install mysql-server
sudo mysql_secure_installation
```

### Option 4: Docker
```bash
docker run --name grassroots-mysql \
  -e MYSQL_ROOT_PASSWORD=root_password \
  -e MYSQL_DATABASE=grassroots_db \
  -p 3306:3306 \
  -d mysql:8.0
```

---

## Setup Steps

### 1. Create Database
```bash
mysql -u root -p
```

```sql
CREATE DATABASE grassroots_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE grassroots_db;
```

### 2. Import Schema
```bash
# From command line
mysql -u root -p grassroots_db < schema.sql

# Or from MySQL client
SOURCE /path/to/schema.sql;
```

### 3. Verify Installation
```sql
SHOW TABLES;
```

You should see all 17 tables created.

---

## Database Access

### Create Application User
```sql
CREATE USER 'grassroots_user'@'localhost' IDENTIFIED BY 'secure_password_here';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON grassroots_db.* TO 'grassroots_user'@'localhost';
GRANT CREATE, ALTER, DROP ON grassroots_db.* TO 'grassroots_user'@'localhost';
GRANT EXECUTE ON grassroots_db.* TO 'grassroots_user'@'localhost';

FLUSH PRIVILEGES;
```

### Connection String for Backend
```
Database: grassroots_db
User: grassroots_user
Password: secure_password_here
Host: localhost
Port: 3306
```

---

## Backend Integration

### Update Flask Backend

In `backend/app.py`, replace MongoDB with MySQL:

```python
from flask_mysql import MySQL

app = Flask(__name__)
mysql = MySQL(app)

app.config['MYSQL_DATABASE_USER'] = 'grassroots_user'
app.config['MYSQL_DATABASE_PASSWORD'] = 'secure_password_here'
app.config['MYSQL_DATABASE_DB'] = 'grassroots_db'
app.config['MYSQL_DATABASE_HOST'] = 'localhost'
```

### Install Required Package
```bash
pip install flask-mysqldb
```

### Example: Get Farmer by ID
```python
@app.route('/api/farmer/<farmer_id>')
def get_farmer(farmer_id):
    cursor = mysql.get_db().cursor()
    cursor.execute('SELECT * FROM farmer_profiles WHERE farmer_id = %s', (farmer_id,))
    farmer = cursor.fetchone()
    return jsonify(farmer)
```

---

## Data Management

### Insert Sample Data

```sql
-- Insert test user (farmer)
INSERT INTO users (email, password_hash, full_name, phone_number, user_type)
VALUES ('farmer@example.com', 'hashed_password_123', 'Raj Kumar', '9876543210', 'farmer');

-- Insert farmer profile
INSERT INTO farmer_profiles (user_id, farm_name, farm_location, farm_area_acres, years_of_experience)
VALUES (1, 'Kumar Farm', 'Punjab', 50.5, 15);

-- Insert crop
INSERT INTO crops (farmer_id, crop_name, crop_type, planting_date, area_acres, expected_yield_quintals)
VALUES (1, 'Basmati Rice 2024', 'Rice', '2024-06-01', 25, 100);

-- Insert QR code
INSERT INTO qr_codes (crop_id, farmer_id, product_name, crop_type, quality_grade, harvest_date, batch_number)
VALUES (1, 1, 'Premium Basmati Rice', 'Rice', 'Premium (Grade A)', '2024-10-15', 'BATCH-2024-001');
```

### Backup Data
```bash
# Full backup
mysqldump -u root -p grassroots_db > grassroots_backup_$(date +%Y%m%d).sql

# Backup specific table
mysqldump -u root -p grassroots_db users > users_backup.sql
```

### Restore Data
```bash
mysql -u root -p grassroots_db < grassroots_backup_20241112.sql
```

---

## Monitoring

### Check Database Size
```sql
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.TABLES 
WHERE table_schema = 'grassroots_db'
ORDER BY size_mb DESC;
```

### View Active Connections
```sql
SHOW PROCESSLIST;
```

### Check Slow Queries
```sql
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
```

---

## Performance Tuning

### Optimize Tables
```sql
OPTIMIZE TABLE users;
OPTIMIZE TABLE crops;
OPTIMIZE TABLE qr_codes;
-- etc. for all tables
```

### Analyze Tables
```sql
ANALYZE TABLE users;
ANALYZE TABLE crops;
```

### Check Index Health
```sql
SELECT OBJECT_SCHEMA, OBJECT_NAME, COUNT_READ, COUNT_INSERT, COUNT_UPDATE, COUNT_DELETE
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE OBJECT_SCHEMA = 'grassroots_db'
ORDER BY COUNT_READ DESC;
```

---

## Troubleshooting

### Connection Refused
- Check MySQL service is running: `sudo systemctl status mysql`
- Verify correct host/port/credentials
- Check firewall allowing port 3306

### Database Lock
```sql
-- Show current locks
SHOW OPEN TABLES WHERE in_use > 0;

-- Kill locked process
KILL <process_id>;
```

### Disk Space Issues
```sql
-- Find large tables
SELECT table_name, ROUND((data_length + index_length) / 1024 / 1024, 2) AS size_mb
FROM information_schema.TABLES
WHERE table_schema = 'grassroots_db'
ORDER BY size_mb DESC;

-- Archive old data
DELETE FROM qr_scan_logs WHERE scan_timestamp < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

### Replication Lag
```sql
SHOW SLAVE STATUS;
```

---

## Security Best Practices

1. **Change Root Password**
   ```bash
   mysqladmin -u root -p password new_password
   ```

2. **Remove Anonymous Users**
   ```sql
   DELETE FROM mysql.user WHERE User='';
   FLUSH PRIVILEGES;
   ```

3. **Limit Remote Root Access**
   ```sql
   DELETE FROM mysql.user WHERE User='root' AND Host!='localhost';
   ```

4. **Use Strong Passwords**
   - Minimum 12 characters
   - Mix uppercase, lowercase, numbers, special chars
   - No dictionary words

5. **Regular Backups**
   - Daily automated backups
   - Test restore procedures
   - Store backups securely

6. **Monitor Access**
   ```sql
   SELECT user, host, Super_priv, Grant_priv FROM mysql.user;
   ```

---

## Production Deployment

### MySQL Configuration (my.cnf)
```ini
[mysqld]
max_connections = 1000
max_allowed_packet = 256M
innodb_buffer_pool_size = 4G
innodb_log_file_size = 512M
log_bin = /var/log/mysql/mysql-bin.log
slow_query_log = /var/log/mysql/slow-query.log
long_query_time = 2
```

### Replication Setup
```sql
-- On Master
CHANGE MASTER TO
  MASTER_HOST='replica_host',
  MASTER_USER='replication_user',
  MASTER_PASSWORD='password',
  MASTER_LOG_FILE='mysql-bin.000001',
  MASTER_LOG_POS=154;

START SLAVE;
```

### High Availability (Percona XtraDB Cluster)
```bash
# Install Percona Server
sudo apt-get install percona-server-server-8.0

# Configure cluster
# Edit my.cnf with wsrep configuration
# Start cluster: systemctl restart mysql
```

---

## Maintenance Tasks

### Daily
- Monitor disk space
- Check error logs
- Verify backups completed

### Weekly
- Analyze tables: `ANALYZE TABLE ...`
- Check slow queries
- Review user access

### Monthly
- `OPTIMIZE TABLE ...` for large tables
- Archive old data
- Update statistics
- Security audit

### Quarterly
- Test disaster recovery
- Review and update indexes
- Capacity planning
- Performance tuning

---

## Connection Details Summary

| Parameter | Value |
|-----------|-------|
| Database Name | grassroots_db |
| Host | localhost |
| Port | 3306 |
| Root User | root |
| App User | grassroots_user |
| Character Set | utf8mb4 |

---

## Quick Commands Reference

```bash
# Connect to database
mysql -u grassroots_user -p grassroots_db

# Show all tables
SHOW TABLES;

# Describe table structure
DESCRIBE users;

# List databases
SHOW DATABASES;

# View current database
SELECT DATABASE();

# Count records in table
SELECT COUNT(*) FROM users;

# Show table size
SELECT ROUND(((data_length + index_length) / 1024 / 1024), 2) as size_mb FROM information_schema.TABLES WHERE table_name = 'users';
```

---

**Last Updated**: November 2024
**Version**: 1.0.0
