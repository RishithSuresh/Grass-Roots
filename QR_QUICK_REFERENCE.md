# QR Code Generation - Quick Reference Guide

## What is This Feature?

This feature allows farmers to create QR codes that encode detailed information about their crops, including:
- ✅ Crop type and quality
- ✅ Harvest date and location
- ✅ Fertilizer used (type and dosage)
- ✅ Pesticide information (or organic certification)
- ✅ Farmer details and batch numbers
- ✅ Price per kilogram

Buyers and retailers can scan these QR codes to verify product authenticity and traceability.

## Key Components

### 1. Frontend (Client-Side)
**File**: `public/qr-generator.html`
- No backend required
- Works entirely in the browser
- Data stored in localStorage
- Uses qrcode.js library from CDN

**Features**:
```
✅ Crop selection from existing records
✅ QR code generation
✅ Download as PNG image
✅ Print functionality
✅ QR code history (10 most recent)
✅ Auto-population from crop data
```

### 2. Backend (Optional)
**Location**: `public/qr_product/`
- Flask application (Python)
- MongoDB database
- Product information persistence
- QR code storage
- Scanner functionality

**Components**:
```
📁 qr_product/
├── app.py                    # Flask application
├── requirements.txt          # Python dependencies
├── templates/
│   ├── index.html           # Generate page
│   ├── view.html            # Product details
│   ├── view_all.html        # Product listing
│   └── scanner.html         # QR scanner
├── static/
│   ├── css/style.css
│   ├── js/scanner.js
│   └── qr_codes/            # Generated QR images
└── README.md                # Full documentation
```

## Data Flow

### Without Backend (Recommended for MVP)
```
Farmer Input
    ↓
Crop Details Auto-Population
    ↓
Add Agricultural Practice Info
    ↓
Generate QR Code (client-side)
    ↓
Save to localStorage
    ↓
Display, Download, Print
```

### With Backend (For Production)
```
Farmer Input
    ↓
Generate QR Code
    ↓
Save to MongoDB
    ↓
Generate QR Image
    ↓
Return Product URL
    ↓
Buyer Scans
    ↓
View Product Details
```

## Installation & Setup

### Option 1: Client-Side Only (No Setup)
1. Open `qr-generator.html` in browser
2. No installation required
3. Data stored in localStorage
4. Works offline

### Option 2: With Backend

**Prerequisites**:
- Python 3.7+
- MongoDB (local or Atlas)
- pip

**Steps**:
```bash
cd qr_product
pip install -r requirements.txt
python app.py
```

Visit: `http://localhost:5000`

## Form Fields Explained

### Required Fields
- **Product/Crop Name** *: Name of the product (e.g., "Basmati Rice")

### Optional Fields
- **Crop Type**: Rice, Wheat, Maize, Vegetables, Cotton, Sugarcane, Other
- **Quality/Grade**: 
  - Premium (Grade A) - Best quality
  - Good (Grade B) - Standard quality
  - Standard (Grade C) - Regular quality
  - Economy - Budget option

### Harvest Details
- **Harvest Date**: When the crop was harvested (YYYY-MM-DD format)
- **Farm Location**: Where the crop was grown (Village, District, State)

### Agricultural Practices
- **Fertilizer Used**: 
  - Example: "Organic compost"
  - Example: "NPK 20:20:20"
  - Example: "Urea 46%"
  - Include type and quantity

- **Pesticides Used**:
  - Example: "Neem oil spray"
  - Example: "Organic bio-insecticide"
  - Leave empty if crop is organic

### Additional Info
- **Batch/Lot Number**: For tracking (e.g., "BATCH-2024-001")
- **Price per kg**: Selling price (e.g., "₹80")
- **Notes**: Any additional information

## QR Code Content Example

When a QR code is scanned, it displays:

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

## localStorage Data Structure

### Crops (farmer_crops)
```javascript
[
  {
    id: 1729000000000,
    type: "Rice",
    plantingDate: "2024-01-15",
    area: 5,
    expectedYield: 25,
    notes: "Organic farming"
  }
]
```

### QR Codes (farmer_qr_codes)
```javascript
[
  {
    id: "qr_1729000000000",
    productName: "Basmati Rice - 5 acres",
    cropType: "Rice",
    quality: "Premium",
    harvestDate: "2024-10-15",
    farmLocation: "Punjab",
    fertilizerUsed: "Organic compost",
    pesticidesUsed: "Neem oil",
    batchNumber: "BATCH-2024-001",
    price: "₹80",
    farmerName: "Raj Kumar",
    farmerEmail: "raj@grassroots.com",
    generatedAt: "2024-10-20T14:30:00Z",
    qrString: "[encoded content]",
    canvasData: "data:image/png;base64,..."
  }
]
```

## Integration with Existing Features

### Crop Information Page (crop-info.html)
- ✅ Farmers register crops with details
- ✅ Data stored in `farmer_crops` key
- ✅ Accessible in QR generator dropdown

### Farmer Dashboard (farmer-dashboard.html)
- ✅ Profile page shows generated QR codes
- ✅ Activity tracking includes QR generation
- ✅ Navigation link to QR generator

### Farmer Profile (farmer-profile.html)
- ✅ Displays QR codes generated count
- ✅ Shows agricultural activity history
- ✅ Lists recent QR generations

## Usage Scenarios

### Scenario 1: Organic Certification
```
Product: Organic Tomatoes
Quality: Premium
Fertilizer: Organic compost only
Pesticides: [EMPTY - No pesticides]
→ Indicates product is organic
```

### Scenario 2: Batch Tracking
```
Product: Rice - Batch 001
Batch Number: BATCH-2024-Q1-001
Harvest Date: 2024-01-15
→ Buyer can track specific batch
```

### Scenario 3: Premium Pricing
```
Product: Basmati Rice
Quality: Premium (Grade A)
Price: ₹120/kg
Fertilizer: Organic
→ Justifies premium price
```

### Scenario 4: Certification
```
Product: Cotton
Quality: Good
Pesticides: Minimal, organic approved
→ Can be certified as eco-friendly
```

## Features & Actions

### Generate QR Code
1. Fill in product information
2. Specify agricultural practices
3. Click "Generate QR Code"
4. QR code appears on screen

### Download QR Code
- Click "📥 Download QR Code"
- Saves as PNG image
- Use for product packaging

### Print QR Code
- Click "🖨️ Print QR Code"
- Opens print dialog
- Ideal for physical labels

### View QR History
- Scroll to "Your Generated QR Codes"
- Shows up to 10 recent QR codes
- View details for each

### Re-download From History
- Find QR in history list
- Click "Download" button
- QR saved as PNG

## Security & Privacy

### What's Encoded in QR
- ✅ Product name and type
- ✅ Quality information
- ✅ Harvest date and location
- ✅ Fertilizer and pesticide details
- ✅ Farmer name (for transparency)

### What's NOT Encoded
- ❌ Farmer contact details (private)
- ❌ Exact GPS coordinates (for privacy)
- ❌ Price (for flexibility)
- ❌ Personal banking info

### Data Protection
- Data stored in browser only (localStorage)
- No external servers contacted (unless backend used)
- Each farmer's data is isolated
- Clear browser data to delete

## Best Practices

### For Farmers

✅ **DO:**
- Be accurate with harvest dates
- List all fertilizers used
- Specify pesticide types for transparency
- Use consistent batch numbering
- Include quality grade
- Note special certifications

❌ **DON'T:**
- Leave required fields empty
- Make up information
- Omit pesticide details (be transparent)
- Use unclear or vague descriptions
- Generate duplicate QR codes

### For Buyers/Retailers

✅ **DO:**
- Scan QR before purchase
- Verify farmer information
- Check harvest date freshness
- Review pesticide information
- Build supplier relationships
- Keep records of scanned QR codes

❌ **DON'T:**
- Trust unverified QR codes
- Skip checking agricultural practices
- Ignore quality grades
- Buy without verification

## Troubleshooting

| Problem | Solution |
|---------|----------|
| QR not generating | Check product name is filled, browser console for errors |
| QR not scannable | Increase size when printing, ensure good lighting |
| Data disappearing | Check localStorage is enabled, don't clear cache |
| Can't see crop dropdown | First create crops in crop-info.html page |
| Download not working | Check browser download settings, try different browser |
| Print looks bad | Adjust printer settings, zoom to 100%, check QR size |

## Next Steps

1. **For Farmers**:
   - Go to crop-info.html and add crops
   - Visit qr-generator.html
   - Generate QR codes for your products
   - Download and print labels
   - Attach to product packaging

2. **For Retailers**:
   - Install QR scanner on smartphone
   - Scan products before purchase
   - Verify farmer information
   - Build trusted supplier network

3. **For Admin** (Optional):
   - Set up Flask backend for persistence
   - Configure MongoDB database
   - Deploy to production server
   - Collect analytics on QR scans

## Resources

- **Frontend Code**: `public/qr-generator.html`
- **Backend Code**: `public/qr_product/app.py`
- **Full Documentation**: `QR_CODE_INTEGRATION.md`
- **Backend README**: `public/qr_product/README.md`
- **Requirements**: `public/qr_product/requirements.txt`

## Support

For issues:
1. Check troubleshooting section above
2. Review browser dev tools console (F12)
3. Check documentation files
4. Restart browser and try again

---

**Last Updated**: November 2024
**Version**: 1.0
**Status**: Production Ready ✅
