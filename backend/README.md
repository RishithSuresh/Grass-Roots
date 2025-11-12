# GrassRoots QR Backend

A Flask-based backend API for generating, storing, and managing QR codes with detailed crop and agricultural practice information.

## Overview

This backend service provides REST API endpoints for:
- **QR Code Generation**: Create QR codes from crop details (quality, harvest time, fertilizer, pesticides)
- **Persistent Storage**: Store QR code data in MongoDB with farmer tracking
- **Scan Tracking**: Monitor QR code scans and engagement metrics
- **History Management**: Retrieve QR code history for each farmer
- **CORS Support**: Enable frontend integration with CORS headers

## Features

### 1. QR Code Generation
- Encodes comprehensive crop and agricultural practice information
- Generates scannable PNG QR codes
- Stores metadata in MongoDB for persistence
- Supports quality grades, batch numbers, and pricing

### 2. Data Persistence
- MongoDB document storage for each generated QR code
- Farmer ownership and authentication
- Automatic timestamps for creation and updates
- Scan tracking and analytics

### 3. Scan Tracking
- Increment scan count on each QR code view
- Record last scanned timestamp
- Generate statistics for farmers

### 4. API Endpoints
All endpoints are available at `/api/qr/*`

#### Health Check
```
GET /api/health
```
Returns API status.

#### Generate QR Code
```
POST /api/qr/generate
Headers:
  - X-Farmer-Email: farmer@example.com
  - X-Farmer-ID: (optional) farmer_id_123

Body:
{
  "productName": "Basmati Rice - Premium Grade",
  "cropType": "Rice",
  "quality": "Premium (Grade A)",
  "harvestDate": "2024-10-15",
  "farmLocation": "Punjab",
  "fertilizerUsed": "Organic compost, NPK 20:20:20",
  "pesticidesUsed": "Neem oil spray",
  "batchNumber": "BATCH-2024-001",
  "price": "₹80/kg",
  "additionalNotes": "Hand-picked, premium quality"
}

Response:
{
  "success": true,
  "message": "QR code generated successfully",
  "qrId": "507f1f77bcf86cd799439011",
  "qrImage": "data:image/png;base64,...",
  "qrData": { ... }
}
```

#### Get QR Code History
```
GET /api/qr/history?limit=20&offset=0
Headers:
  - X-Farmer-Email: farmer@example.com

Response:
{
  "success": true,
  "total": 45,
  "offset": 0,
  "limit": 20,
  "qrCodes": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "productName": "Basmati Rice",
      "cropType": "Rice",
      "quality": "Premium (Grade A)",
      "harvestDate": "2024-10-15",
      ...
      "scans": 12,
      "createdAt": "2024-10-20T14:30:00.000Z"
    }
  ]
}
```

#### View QR Code Details (Public)
```
GET /api/qr/view/<qr_id>

Response:
{
  "success": true,
  "qrCode": {
    "_id": "507f1f77bcf86cd799439011",
    "productName": "Basmati Rice",
    "scans": 13,
    "lastScannedAt": "2024-10-21T10:15:00.000Z",
    ...
  }
}
```
Note: This endpoint is public and automatically increments the scan counter.

#### Update QR Code
```
PUT /api/qr/update/<qr_id>
Headers:
  - X-Farmer-Email: farmer@example.com

Body:
{
  "productName": "Updated Product Name",
  "quality": "Good (Grade B)",
  "price": "₹70/kg",
  "additionalNotes": "Updated notes"
}

Response:
{
  "success": true,
  "message": "QR code updated successfully",
  "qrCode": { ... }
}
```
Only the farmer who created the QR code can update it. Limited fields can be updated.

#### Delete QR Code
```
DELETE /api/qr/delete/<qr_id>
Headers:
  - X-Farmer-Email: farmer@example.com

Response:
{
  "success": true,
  "message": "QR code deleted successfully",
  "qrId": "507f1f77bcf86cd799439011"
}
```

#### Get QR Code Statistics
```
GET /api/qr/stats
Headers:
  - X-Farmer-Email: farmer@example.com

Response:
{
  "success": true,
  "stats": {
    "totalQRCodes": 15,
    "totalScans": 234,
    "averageScansPerQR": 15,
    "mostScannedProduct": "Basmati Rice",
    "mostScannedCount": 45
  }
}
```

## Installation

### Prerequisites
- Python 3.7+
- MongoDB (local or MongoDB Atlas cloud)
- pip

### Setup Steps

1. **Clone/Navigate to backend directory**
```bash
cd backend
```

2. **Create a virtual environment (optional but recommended)**
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**

Create a `.env` file in the backend directory:
```
MONGO_URI=mongodb://localhost:27017/grassroots_qr
FLASK_HOST=127.0.0.1
FLASK_PORT=5000
FLASK_DEBUG=True
SECRET_KEY=your-secret-key-here-change-in-production
```

For MongoDB Atlas (cloud):
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/grassroots_qr?retryWrites=true&w=majority
```

5. **Run the application**
```bash
python app.py
```

The server will start on `http://127.0.0.1:5000`

## MongoDB Schema

### QR Codes Collection

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
  qrImage: String,  // base64 encoded PNG
  scans: Number,
  lastScannedAt: String (ISO 8601 timestamp),
  createdAt: String (ISO 8601 timestamp),
  updatedAt: String (ISO 8601 timestamp)
}
```

### Indexes

For production, create these indexes:
```javascript
db.qr_codes.createIndex({ "farmerEmail": 1, "createdAt": -1 })
db.qr_codes.createIndex({ "createdAt": -1 })
db.qr_codes.createIndex({ "scans": -1 })
```

## Frontend Integration

### Using the API from `qr-generator.html`

The frontend can optionally sync with this backend:

```javascript
// Example: Send QR data to backend
const qrData = {
  productName: "Basmati Rice",
  cropType: "Rice",
  quality: "Premium (Grade A)",
  harvestDate: "2024-10-15",
  farmLocation: "Punjab",
  fertilizerUsed: "Organic compost, NPK 20:20:20",
  pesticidesUsed: "Neem oil spray",
  batchNumber: "BATCH-2024-001",
  price: "₹80/kg",
  additionalNotes: "Hand-picked"
};

fetch('http://127.0.0.1:5000/api/qr/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Farmer-Email': 'farmer@example.com',
    'X-Farmer-ID': 'farmer_123'
  },
  body: JSON.stringify(qrData)
})
.then(res => res.json())
.then(data => {
  console.log('QR Generated:', data.qrId);
  console.log('QR Image:', data.qrImage);
})
.catch(err => console.error('Error:', err));
```

## Deployment

### Local Development
```bash
python app.py
```

### Production with Gunicorn
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Docker (optional)
Create a `Dockerfile`:
```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY app.py .
CMD ["python", "app.py"]
```

Build and run:
```bash
docker build -t grassroots-qr-backend .
docker run -p 5000:5000 -e MONGO_URI=mongodb://... grassroots-qr-backend
```

## Authentication

Currently, the backend uses simple header-based authentication:
- `X-Farmer-Email`: Farmer's email (required for protected endpoints)
- `X-Farmer-ID`: Farmer's ID (optional, for additional tracking)

**For production**, implement JWT tokens:
```python
from flask_jwt_extended import JWTManager, create_access_token, jwt_required

jwt = JWTManager(app)

# Create token on login
@app.route('/auth/login', methods=['POST'])
def login():
    farmer_email = request.json.get('email')
    token = create_access_token(identity=farmer_email)
    return jsonify({"token": token})

# Use in protected routes
@app.route('/api/qr/history')
@jwt_required()
def get_qr_history():
    ...
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or failed
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## API Testing

### Using cURL

Generate QR:
```bash
curl -X POST http://localhost:5000/api/qr/generate \
  -H "Content-Type: application/json" \
  -H "X-Farmer-Email: farmer@example.com" \
  -d '{
    "productName": "Basmati Rice",
    "cropType": "Rice",
    "quality": "Premium (Grade A)",
    "harvestDate": "2024-10-15",
    "farmLocation": "Punjab",
    "fertilizerUsed": "Organic compost, NPK 20:20:20",
    "pesticidesUsed": "Neem oil spray",
    "batchNumber": "BATCH-2024-001",
    "price": "₹80/kg"
  }'
```

Get history:
```bash
curl -H "X-Farmer-Email: farmer@example.com" \
  http://localhost:5000/api/qr/history
```

View QR:
```bash
curl http://localhost:5000/api/qr/view/507f1f77bcf86cd799439011
```

### Using Postman

1. Import the API endpoints listed above
2. Set `X-Farmer-Email` header in each request
3. Use JSON body for POST/PUT requests
4. Test CORS by making requests from `public/qr-generator.html`

## Performance Optimization

1. **Database Indexes**: Create indexes on frequently queried fields
2. **Pagination**: Use `limit` and `offset` parameters for history endpoint
3. **Caching**: Implement Redis caching for frequently accessed QR codes
4. **Image Compression**: Store QR images as base64 or reference external image storage (S3)

## Security Considerations

1. **HTTPS**: Use HTTPS in production
2. **CORS**: Restrict CORS origins to your frontend domain
3. **Authentication**: Implement JWT tokens instead of header-based auth
4. **Rate Limiting**: Add rate limiting to prevent abuse
5. **Input Validation**: Validate and sanitize all input data
6. **MongoDB Connection**: Use strong passwords and connection strings

## Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB is running: `mongod`
- Check `MONGO_URI` configuration
- Verify MongoDB credentials for Atlas

### CORS Errors
- Ensure `flask-cors` is installed
- Check CORS configuration in `app.py`
- Verify frontend is making requests to correct backend URL

### QR Code Generation Failed
- Check if all required fields are provided
- Verify `qrcode` library is installed
- Check server logs for detailed error messages

## Future Enhancements

1. **JWT Authentication**: Replace header-based auth with JWT tokens
2. **Batch Operations**: Generate multiple QR codes at once
3. **QR Sharing**: Create shareable links for QR codes
4. **Analytics Dashboard**: Visual analytics for QR scans
5. **Webhook Integration**: Notify on QR code scans
6. **Blockchain Verification**: Add blockchain verification for authenticity
7. **Mobile App Integration**: Dedicated mobile app for QR management

## Support

For issues or questions:
1. Check MongoDB connection and database
2. Review Flask error logs
3. Verify CORS configuration
4. Check frontend network requests in browser DevTools
5. Refer to Flask and PyMongo documentation

## License

Part of the GrassRoots Platform

---

**Last Updated**: November 2024
**Version**: 1.0.0
