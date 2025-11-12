# Quick Start - GrassRoots QR Backend

Get the QR backend running in 5 minutes.

## Prerequisites
- Python 3.7+ installed
- MongoDB local or MongoDB Atlas account

## Installation & Run

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure MongoDB
Create `.env` file:

**For Local MongoDB:**
```
MONGO_URI=mongodb://localhost:27017/grassroots_qr
FLASK_HOST=127.0.0.1
FLASK_PORT=5000
FLASK_DEBUG=True
```

**For MongoDB Atlas (Cloud):**
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/grassroots_qr?retryWrites=true&w=majority
FLASK_HOST=127.0.0.1
FLASK_PORT=5000
FLASK_DEBUG=True
```

### 3. Start Backend Server
```bash
python app.py
```

✅ Backend running at `http://127.0.0.1:5000`

## Test It

### Generate QR Code
```bash
curl -X POST http://localhost:5000/api/qr/generate \
  -H "Content-Type: application/json" \
  -H "X-Farmer-Email: farmer@farm.com" \
  -d '{
    "productName": "Basmati Rice",
    "cropType": "Rice",
    "quality": "Premium (Grade A)",
    "harvestDate": "2024-10-15",
    "farmLocation": "Punjab",
    "fertilizerUsed": "Organic compost",
    "pesticidesUsed": "Neem oil"
  }'
```

### Get QR History
```bash
curl -H "X-Farmer-Email: farmer@farm.com" \
  http://localhost:5000/api/qr/history
```

## Connect Frontend

In `public/qr-generator.html`, after generating QR, call:

```javascript
// Send QR data to backend
fetch('http://127.0.0.1:5000/api/qr/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Farmer-Email': localStorage.getItem('userEmail')
  },
  body: JSON.stringify(qrData)
})
.then(res => res.json())
.then(data => console.log('QR stored:', data.qrId))
.catch(err => console.error('Error:', err));
```

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/qr/generate` | Generate new QR code |
| GET | `/api/qr/history` | Get farmer's QR codes |
| GET | `/api/qr/view/<id>` | View QR details (public) |
| PUT | `/api/qr/update/<id>` | Update QR code |
| DELETE | `/api/qr/delete/<id>` | Delete QR code |
| GET | `/api/qr/stats` | Get statistics |

All endpoints except `/api/qr/view/<id>` require `X-Farmer-Email` header.

## Troubleshooting

**MongoDB Connection Error?**
- Ensure MongoDB is running: `mongod`
- Check MONGO_URI in .env
- For Atlas: whitelist your IP in database access settings

**Port Already in Use?**
```bash
# Change FLASK_PORT in .env to 5001, 5002, etc.
FLASK_PORT=5001
```

**CORS Error on Frontend?**
- CORS is enabled for all origins in app.py
- Check backend URL matches frontend request URL
- Verify `X-Farmer-Email` header is sent from frontend

## Full Documentation

See `backend/README.md` and `BACKEND_INTEGRATION.md` for complete API documentation and advanced setup.

---

**Need Help?** Check the error logs printed in terminal when running `python app.py`
