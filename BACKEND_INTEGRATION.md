# GrassRoots Backend Integration Guide

This guide explains how to integrate the Flask backend with the frontend QR generator.

## Architecture

```
┌─────────────────────────────────────┐
│  Frontend (public/qr-generator.html) │
│  - Client-side QR generation         │
│  - localStorage persistence          │
│  - Optional backend sync             │
└──────────┬──────────────────────────┘
           │
           │ HTTP Requests (CORS)
           │
┌──────────▼──────────────────────────┐
│  Flask Backend (backend/app.py)      │
│  - QR code generation & storage      │
│  - MongoDB persistence               │
│  - Scan tracking & analytics         │
└──────────┬──────────────────────────┘
           │
           │ MongoDB Queries
           │
┌──────────▼──────────────────────────┐
│  MongoDB Database                    │
│  - qr_codes collection               │
│  - Farmer QR history                 │
└──────────────────────────────────────┘
```

## Setup Instructions

### 1. Backend Setup

#### Install MongoDB
- **Local**: Download from https://www.mongodb.com/try/download/community
- **Cloud**: Use MongoDB Atlas at https://www.mongodb.com/cloud/atlas (free tier available)

#### Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Configure Environment
```bash
# Copy example to .env
cp .env.example .env

# Edit .env with your MongoDB URI
# For local: mongodb://localhost:27017/grassroots_qr
# For Atlas: mongodb+srv://user:pass@cluster.mongodb.net/grassroots_qr
```

#### Run Backend Server
```bash
python app.py
```
Server will be available at `http://127.0.0.1:5000`

### 2. Frontend Integration

The frontend (`public/qr-generator.html`) works in two modes:

#### Mode 1: Client-Side Only (Default)
- QR codes generated in browser
- Data stored in localStorage
- No backend required
- **Best for**: Development, offline usage, prototypes

#### Mode 2: With Backend Sync
- Client-side generation + backend persistence
- Farmer's QR codes synced to database
- Scan tracking and analytics
- **Best for**: Production, multi-device access, analytics

### 3. Enable Backend Sync in Frontend

Add these functions to `qr-generator.html` after QR generation:

```javascript
// Send QR data to backend after generation
async function sendQRToBackend(qrData) {
    const backendURL = 'http://127.0.0.1:5000/api/qr/generate';
    
    try {
        const response = await fetch(backendURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Farmer-Email': localStorage.getItem('userEmail'),
                'X-Farmer-ID': 'farmer_' + Date.now()
            },
            body: JSON.stringify({
                productName: qrData.productName,
                cropType: qrData.cropType,
                quality: qrData.quality,
                harvestDate: qrData.harvestDate,
                farmLocation: qrData.farmLocation,
                fertilizerUsed: qrData.fertilizerUsed,
                pesticidesUsed: qrData.pesticidesUsed,
                batchNumber: qrData.batchNumber,
                price: qrData.price,
                additionalNotes: qrData.additionalNotes
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('QR stored on backend:', result.qrId);
            return result;
        } else {
            console.error('Backend sync failed:', await response.json());
        }
    } catch (error) {
        console.error('Backend connection error:', error);
        // QR still works client-side even if backend fails
    }
}

// Load QR history from backend
async function loadBackendQRHistory() {
    const backendURL = 'http://127.0.0.1:5000/api/qr/history';
    
    try {
        const response = await fetch(backendURL, {
            headers: {
                'X-Farmer-Email': localStorage.getItem('userEmail')
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            return result.qrCodes;
        }
    } catch (error) {
        console.error('Failed to load backend history:', error);
    }
    
    return [];
}
```

### 4. API Endpoints Reference

All endpoints require the `X-Farmer-Email` header (except public endpoints).

**Base URL**: `http://127.0.0.1:5000`

#### Generate QR Code
```
POST /api/qr/generate
Header: X-Farmer-Email: farmer@example.com
Body: { productName, cropType, quality, harvestDate, ... }
```

#### Get QR History
```
GET /api/qr/history?limit=20&offset=0
Header: X-Farmer-Email: farmer@example.com
```

#### View QR (Public - anyone can access)
```
GET /api/qr/view/<qr_id>
```

#### Update QR
```
PUT /api/qr/update/<qr_id>
Header: X-Farmer-Email: farmer@example.com
Body: { productName, quality, price, ... }
```

#### Delete QR
```
DELETE /api/qr/delete/<qr_id>
Header: X-Farmer-Email: farmer@example.com
```

#### Get Statistics
```
GET /api/qr/stats
Header: X-Farmer-Email: farmer@example.com
```

## Frontend QR Display Options

### Option 1: Display QR Image from Backend
```html
<img id="qrImage" src="" alt="QR Code">

<script>
    async function displayQRFromBackend(qrId) {
        const response = await fetch(`http://127.0.0.1:5000/api/qr/view/${qrId}`);
        const data = await response.json();
        document.getElementById('qrImage').src = 'data:image/png;base64,' + data.qrCode.qrImage;
    }
</script>
```

### Option 2: Display QR Image from Client localStorage
```javascript
// Image already available as canvas.toDataURL('image/png')
// No additional backend call needed
```

## MongoDB Data Model

QR codes are stored in MongoDB with this structure:

```javascript
{
  _id: ObjectId,
  productName: String,
  cropType: String,
  quality: String,
  harvestDate: String,
  farmLocation: String,
  fertilizerUsed: String,
  pesticidesUsed: String,
  batchNumber: String,
  price: String,
  additionalNotes: String,
  farmerEmail: String,
  farmerID: String,
  qrText: String,
  qrImage: String,        // base64 encoded PNG
  scans: Number,          // incremented on each view
  lastScannedAt: String,  // ISO 8601 timestamp
  createdAt: String,      // ISO 8601 timestamp
  updatedAt: String       // ISO 8601 timestamp
}
```

## Deployment Options

### Option 1: Local Development (Client + Server)
```
Frontend: Open public/qr-generator.html in browser
Backend: python app.py
Database: MongoDB local instance
```

### Option 2: Production (Recommended)
```
Frontend: Deploy public/ to static web hosting (Netlify, Vercel, etc.)
Backend: Deploy to Heroku, AWS Lambda, or dedicated server
Database: MongoDB Atlas cloud instance
```

### Option 3: Docker Deployment
See backend/README.md for Docker setup.

## Security Best Practices

1. **Use HTTPS** in production
2. **Implement JWT** instead of header-based auth
3. **Validate Input** on both frontend and backend
4. **Restrict CORS** to your frontend domain
5. **Use Environment Variables** for sensitive data
6. **Rate Limit** API endpoints
7. **Store Secrets** securely (never commit .env to git)

## Troubleshooting

### Backend Not Connecting
- Check backend server is running: `python app.py`
- Verify CORS is enabled in Flask
- Check browser console for CORS errors
- Ensure `X-Farmer-Email` header is sent

### MongoDB Connection Error
- Verify MongoDB is running
- Check MONGO_URI in .env
- For Atlas: verify whitelist includes your IP
- Test connection: `mongo "mongodb://localhost:27017"`

### QR Not Generated
- Check all required fields are provided
- Check browser console for JavaScript errors
- Verify qrcode.js library is loaded
- Test API manually with curl or Postman

### QR Images Not Displaying
- Ensure backend returns base64 image data
- Check image format is correct (data:image/png;base64,...)
- Verify CORS headers allow image transfer

## Testing the Integration

### Manual Testing with cURL

1. Generate QR on backend:
```bash
curl -X POST http://localhost:5000/api/qr/generate \
  -H "Content-Type: application/json" \
  -H "X-Farmer-Email: test@farm.com" \
  -d '{
    "productName": "Test Rice",
    "cropType": "Rice",
    "quality": "Premium (Grade A)",
    "harvestDate": "2024-10-15",
    "farmLocation": "Punjab",
    "fertilizerUsed": "Compost",
    "pesticidesUsed": "Neem oil"
  }'
```

2. Get farmer's QR history:
```bash
curl -H "X-Farmer-Email: test@farm.com" \
  http://localhost:5000/api/qr/history
```

3. View specific QR (this increments scan count):
```bash
curl http://localhost:5000/api/qr/view/507f1f77bcf86cd799439011
```

### Postman Testing

1. Create collection: "GrassRoots QR API"
2. Add requests for each endpoint
3. Set `X-Farmer-Email` in pre-request script:
```javascript
pm.request.headers.add({
  key: 'X-Farmer-Email',
  value: 'test@farm.com'
});
```

## Performance Tips

- Limit QR history to 20 per page (use pagination)
- Index MongoDB on `farmerEmail` and `createdAt`
- Cache QR images in browser localStorage
- Use CDN for static assets
- Compress QR images for storage

## Next Steps

1. ✅ Backend is created and documented
2. ⬜ Integrate backend endpoints into frontend (optional)
3. ⬜ Test QR generation and retrieval
4. ⬜ Deploy to production (Heroku/AWS/etc)
5. ⬜ Monitor and optimize performance
6. ⬜ Add JWT authentication
7. ⬜ Implement scan analytics dashboard

---

**Last Updated**: November 2024
