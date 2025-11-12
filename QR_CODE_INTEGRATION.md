# QR Code Generation Integration Guide - GrassRoots

## Overview

The GrassRoots platform now includes comprehensive QR code generation functionality that allows farmers to create scannable QR codes containing detailed crop information including quality, harvest time, fertilizer used, and pesticides applied.

## System Architecture

### Client-Side (Frontend)
- **File**: `public/qr-generator.html`
- **Technology**: Vanilla JavaScript + qrcode.js library
- **Storage**: Browser localStorage
- **Features**:
  - Crop selection and auto-population
  - QR code generation
  - Download/print functionality
  - QR history management

### Server-Side Backend (Optional)
- **Location**: `public/qr_product/`
- **Technology**: Flask + MongoDB
- **Features**:
  - Product database persistence
  - QR code storage
  - Product verification
  - QR scanner functionality

## Data Structure

### Crop Data (from crop-info.html)
```javascript
{
  id: timestamp,
  type: "Rice",
  plantingDate: "2024-01-15",
  area: 5,
  expectedYield: 25,
  notes: "Organic farming"
}
```

### QR Code Data (Generated)
```javascript
{
  id: "qr_<timestamp>",
  productName: "Basmati Rice - 5 acres",
  cropType: "Rice",
  quality: "Premium",
  harvestDate: "2024-10-15",
  farmLocation: "Punjab",
  fertilizerUsed: "Organic compost, NPK 20:20:20",
  pesticidesUsed: "Neem oil spray",
  batchNumber: "BATCH-2024-001",
  price: "₹80",
  notes: "Hand-picked, premium quality",
  farmerEmail: "farmer@grassroots.com",
  farmerName: "Raj Kumar",
  generatedAt: "2024-10-20T14:30:00Z",
  qrString: "QR encoded data",
  canvasData: "data:image/png;base64,..."
}
```

## Features Explanation

### 1. Crop Selection
Farmers can select from previously registered crops to automatically populate form fields:
- Product name
- Crop type
- Area details
- Expected yield

### 2. Quality Tracking
Four quality grades available:
- **Premium (Grade A)**: Best quality, highest price
- **Good (Grade B)**: Standard quality
- **Standard (Grade C)**: Regular quality
- **Economy**: Budget option

### 3. Agricultural Practices Documentation
Farmers specify:
- **Fertilizers Used**: Type, dosage, frequency
  - Examples: Organic compost, NPK 20:20:20, Urea
- **Pesticides Used**: Type and application method
  - Examples: Neem oil spray, Organic BioInsecticide
  - Can indicate "Organic" if no pesticides used

### 4. QR Code Content
The QR code encodes the following information:
```
GrassRoots QR
Product: Basmati Rice
Type: Rice
Quality: Premium
Harvest: 2024-10-15
Location: Punjab
Fertilizer: Organic compost, NPK 20:20:20
Pesticides: Neem oil spray
Farmer: Raj Kumar
Generated: 10/20/2024, 2:30:00 PM
```

### 5. Storage & Management
- QR codes stored in browser localStorage
- Up to 10 recent QR codes displayed in list
- Each QR code can be:
  - Downloaded as PNG image
  - Printed for physical labeling
  - Viewed again from history
  - Shared with buyers or retailers

## User Workflows

### For Farmers

#### Step 1: Access QR Generator
1. Login to GrassRoots
2. Navigate to Farmer Dashboard
3. Click "QR Code Generator" feature box
4. Or visit `qr-generator.html` directly

#### Step 2: Generate QR Code

**Option A: From Existing Crop**
1. Select crop from dropdown
2. Crop details auto-populate
3. Fill in quality and harvest information
4. Specify fertilizer details
5. Specify pesticide information (or indicate organic)
6. Add batch number if available
7. Click "Generate QR Code"

**Option B: Manual Entry**
1. Skip crop selection
2. Manually enter all product information
3. Fill in all required agricultural practice fields
4. Click "Generate QR Code"

#### Step 3: Use Generated QR Code
1. Download QR code as PNG image
2. Print QR code for labeling
3. Attach to product packaging
4. Share with retailers/distributors
5. Track QR in history section

### For Buyers/Retailers

#### Scanning QR Code
1. Open smartphone camera or dedicated app
2. Point at QR code on product
3. Tap notification to open link
4. View complete product information
5. Verify farmer details and practices
6. Check quality and harvest information

#### Information Available After Scanning
- Product name and type
- Harvest date and location
- Fertilizer used (traceability)
- Pesticide information (organic certification possible)
- Farmer name and contact
- Batch/lot number for traceability
- Price information

## localStorage Keys

### Crops Data
- **Key**: `farmer_crops`
- **Type**: Array of crop objects
- **Used by**: crop-info.html, qr-generator.html

### QR Codes Data
- **Key**: `farmer_qr_codes`
- **Type**: Array of QR code objects
- **Used by**: qr-generator.html, farmer-profile.html

### Farmer Notifications
- **Key**: `farmer_notifications`
- **Type**: Array of notification objects
- **Used by**: farmer-dashboard.html, farmer-profile.html

## Backend Integration (Optional)

The project previously included an optional Flask backend (now removed). The active implementation is client-side only and uses `public/qr-generator.html` with browser localStorage. If server-side persistence is required later, you can add a backend that follows the previously-documented schema and routes.

### Database Schema
```javascript
// MongoDB collection: products
{
  _id: ObjectId,
  product_name: String,
  category: String,
  farmer: String,
  location: String,
  fertilizer: String,
  pesticide: String,
  harvest_date: String,
  cost_per_kg: String,
  notes: String
}
```

### Flask Routes Available
- `GET /` - Generation form
- `POST /generate` - Create product and QR
- `GET /view/<id>` - View product details
- `GET /all` - List all products
- `GET /scanner` - QR scanner
- `GET /regenerate_qr/<id>` - Regenerate QR
- `POST /delete_all` - Delete all products

## Setup Instructions

### Client-Side Only (No Backend)
1. No setup required
2. Open `qr-generator.html` in browser
3. Data stored in browser localStorage only
4. Data persists as long as browser cache is not cleared

### With Backend (Full Functionality)

#### Prerequisites
- Python 3.7+
- MongoDB (local or Atlas)
- pip

#### Installation
```bash
cd qr_product
pip install -r requirements.txt
python app.py
```

#### Configuration
```python
# app.py
BASE_URL = "http://127.0.0.1:5000"  # Change for production
MONGO_URI = "mongodb://localhost:27017"  # Or use MongoDB Atlas
```
## Deployment Options

1) Client-Side Only (recommended for prototypes)
   - No setup required. Open `public/qr-generator.html` in a browser. Data is stored in localStorage.

2) Server-Side (optional, reintroduce if you need persistence)
   - Implement a backend (Flask or any stack) that accepts QR payloads and stores them in a database. The removed Flask prototype was a reference implementation; reintroduce it if you require centralized storage or externally-accessible QR pages.

## QR Code Best Practices

### For Farmers

1. **Include All Information**
   - Complete fertilizer details
   - Pesticide information (or indicate organic)
   - Accurate harvest dates
   - Clear location information

2. **Quality Grades**
   - Premium: Only for best quality crops
   - Good: Standard market quality
   - Standard: Acceptable quality
   - Economy: Budget options

3. **Batch Management**
   - Use unique batch numbers
   - Group similar crops by batch
   - Track batch-to-batch variations

4. **Documentation**
   - Keep notes on agricultural practices
   - Document special certifications
   - Record price variations by quality

### For Buyers/Retailers

1. **Verification Steps**
   - Scan QR code before purchase
   - Verify farmer information
   - Check harvest date freshness
   - Confirm no harmful pesticides used

2. **Storage**
   - Save QR code data for records
   - Track which products are popular
   - Build supplier relationships

3. **Consumer Trust**
   - Display QR codes to customers
   - Provide traceability information
   - Build transparency and trust

## Security Features

### Data Validation
- Product name required
- Harvest date format validated
- Email validation for farmer contact
- Input sanitization on all fields

### Authentication
- Farmer-only access to generation page
- Login requirement before QR creation
- Session-based security with localStorage

### Privacy
- Farmer email not publicly exposed in QR
- Location can be generalized
- Optional batch number for anonymity

## Troubleshooting

### QR Code Not Generating
**Problem**: QR code generation fails
**Solution**: 
- Check browser console for errors
- Ensure qrcode.js library loaded from CDN
- Verify all required fields filled

### QR Code Not Scannable
**Problem**: Generated QR cannot be scanned
**Solution**:
- Increase QR size when printing
- Ensure good lighting when scanning
- Use dedicated QR scanner app
- Check QR code image quality

### Data Not Persisting
**Problem**: QR codes disappear after reload
**Solution**:
- Enable localStorage in browser settings
- Check browser privacy/incognito mode
- Clear only selected data, not all cache
- Use backend database for permanent storage

### Backend Not Connecting
**Problem**: Cannot connect to Flask backend
**Solution**:
- Ensure Flask app is running: `python app.py`
- Check Flask server is on correct port (5000)
- Verify MongoDB is running
- Check network connectivity
- Review Flask error logs

## Performance Optimization

### Client-Side
- QR codes cached as base64 data URLs
- Limited to 10 most recent QR codes in display
- Smooth scrolling for history viewing

### Database
- Indexed searches on farmer and product name
- Efficient pagination for product listing
- Automatic cleanup of old QR images

## Future Enhancements

1. **Batch Operations**
   - Generate multiple QR codes at once
   - Bulk upload crop data

2. **Analytics**
   - Track QR code scans
   - Monitor buyer engagement
   - Generate sales insights

3. **Certifications**
   - Organic certification QR
   - Quality standard marks
   - Export compliance codes

4. **Integration**
   - E-commerce platform integration
   - Wholesale marketplace connection
   - Mobile app sync

5. **Advanced Features**
   - Blockchain verification
   - Temperature/humidity tracking
   - Supply chain traceability
   - Batch expiration alerts

## Documentation Files

- `README.md` - Backend Flask application documentation
- `INTEGRATION.md` - This file
- `qr-generator.html` - Frontend QR generator page
- `requirements.txt` - Python dependencies
- `app.py` - Flask backend application
- Template files in `templates/` folder
- Styles in `static/css/`
- Scanner logic in `static/js/`

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review console logs in browser dev tools
3. Check Flask application error logs
4. Refer to MongoDB documentation
5. Contact GrassRoots team

## Version History

**Version 1.0** (Current)
- Client-side QR generation with crop integration
- Quality and harvest tracking
- Agricultural practice documentation
- Download and print functionality
- Browser-based storage
- Optional Flask backend support

---

**Last Updated**: November 2024
**Maintained By**: GrassRoots Development Team
