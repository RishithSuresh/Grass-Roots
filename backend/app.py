import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
from bson.objectid import ObjectId
from bson.errors import InvalidId
import qrcode
from io import BytesIO
import base64
from datetime import datetime
from functools import wraps
import json

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config["MONGO_URI"] = os.getenv(
    "MONGO_URI", 
    "mongodb://localhost:27017/grassroots_qr"
)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
app.config["JSON_SORT_KEYS"] = False

# Enable CORS
CORS(app, resources={
    r"/api/*": {
        "origins": ["*"],
        "methods": ["GET", "POST", "DELETE", "PUT"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Initialize PyMongo
mongo = PyMongo(app)

# ========== AUTHENTICATION & AUTHORIZATION ==========

def require_farmer_token(f):
    """Decorator to check if request includes valid farmer authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Check for authorization header or session token
        auth_header = request.headers.get('Authorization', '')
        farmer_email = request.headers.get('X-Farmer-Email', '')
        farmer_id = request.headers.get('X-Farmer-ID', '')
        
        # For demo: accept if at least farmer_email is provided
        # In production: validate JWT tokens
        if not farmer_email:
            return jsonify({"error": "Unauthorized: Missing farmer email"}), 401
        
        # Store farmer info in request context
        request.farmer_email = farmer_email
        request.farmer_id = farmer_id
        
        return f(*args, **kwargs)
    
    return decorated_function

# ========== ROUTES ==========

@app.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "message": "GrassRoots QR Backend is running",
        "version": "1.0.0"
    }), 200

@app.route("/api/qr/generate", methods=["POST"])
@require_farmer_token
def generate_qr():
    """
    Generate and store QR code with crop details
    
    Expected JSON payload:
    {
        "productName": "Basmati Rice",
        "cropType": "Rice",
        "quality": "Premium (Grade A)",
        "harvestDate": "2024-10-15",
        "farmLocation": "Punjab",
        "fertilizerUsed": "Organic compost, NPK 20:20:20",
        "pesticidesUsed": "Neem oil spray",
        "batchNumber": "BATCH-2024-001",
        "price": "₹80",
        "additionalNotes": "..."
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = [
            "productName", "cropType", "quality", 
            "harvestDate", "farmLocation", 
            "fertilizerUsed", "pesticidesUsed"
        ]
        
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Create QR code document
        qr_document = {
            "productName": data.get("productName"),
            "cropType": data.get("cropType"),
            "quality": data.get("quality"),
            "harvestDate": data.get("harvestDate"),
            "farmLocation": data.get("farmLocation"),
            "fertilizerUsed": data.get("fertilizerUsed"),
            "pesticidesUsed": data.get("pesticidesUsed"),
            "batchNumber": data.get("batchNumber", ""),
            "price": data.get("price", ""),
            "additionalNotes": data.get("additionalNotes", ""),
            "farmerEmail": request.farmer_email,
            "farmerID": request.farmer_id or "",
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat(),
            "qrText": format_qr_text(data),
            "scans": 0,
            "lastScannedAt": None
        }
        
        # Insert into MongoDB
        result = mongo.db.qr_codes.insert_one(qr_document)
        qr_id = str(result.inserted_id)
        
        # Generate QR code image
        qr_code = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr_code.add_data(qr_document["qrText"])
        qr_code.make(fit=True)
        
        img = qr_code.make_image(fill_color="black", back_color="white")
        
        # Convert image to base64
        img_buffer = BytesIO()
        img.save(img_buffer, format='PNG')
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode('utf-8')
        
        # Update document with QR image
        mongo.db.qr_codes.update_one(
            {"_id": ObjectId(qr_id)},
            {"$set": {"qrImage": img_base64}}
        )
        
        return jsonify({
            "success": True,
            "message": "QR code generated successfully",
            "qrId": qr_id,
            "qrImage": img_base64,
            "qrData": qr_document
        }), 201
    
    except Exception as e:
        print(f"Error in /api/qr/generate: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/qr/history", methods=["GET"])
@require_farmer_token
def get_qr_history():
    """Get QR code history for the farmer"""
    try:
        limit = request.args.get("limit", 20, type=int)
        offset = request.args.get("offset", 0, type=int)
        
        # Fetch QR codes for this farmer, sorted by creation date (newest first)
        qr_codes = list(
            mongo.db.qr_codes.find(
                {"farmerEmail": request.farmer_email}
            ).sort("createdAt", -1).skip(offset).limit(limit)
        )
        
        # Convert ObjectId to string for JSON serialization
        for qr in qr_codes:
            qr["_id"] = str(qr["_id"])
        
        total_count = mongo.db.qr_codes.count_documents(
            {"farmerEmail": request.farmer_email}
        )
        
        return jsonify({
            "success": True,
            "total": total_count,
            "offset": offset,
            "limit": limit,
            "qrCodes": qr_codes
        }), 200
    
    except Exception as e:
        print(f"Error in /api/qr/history: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/qr/view/<qr_id>", methods=["GET"])
def view_qr(qr_id):
    """View details of a specific QR code (public access with increment scan count)"""
    try:
        # Validate ObjectId
        try:
            obj_id = ObjectId(qr_id)
        except InvalidId:
            return jsonify({"error": "Invalid QR ID format"}), 400
        
        # Fetch QR code document
        qr_doc = mongo.db.qr_codes.find_one({"_id": obj_id})
        
        if not qr_doc:
            return jsonify({"error": "QR code not found"}), 404
        
        # Increment scan count
        mongo.db.qr_codes.update_one(
            {"_id": obj_id},
            {
                "$inc": {"scans": 1},
                "$set": {"lastScannedAt": datetime.utcnow().isoformat()}
            }
        )
        
        qr_doc["_id"] = str(qr_doc["_id"])
        
        return jsonify({
            "success": True,
            "qrCode": qr_doc
        }), 200
    
    except Exception as e:
        print(f"Error in /api/qr/view/{qr_id}: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/qr/delete/<qr_id>", methods=["DELETE"])
@require_farmer_token
def delete_qr(qr_id):
    """Delete a QR code (only by the farmer who created it)"""
    try:
        try:
            obj_id = ObjectId(qr_id)
        except InvalidId:
            return jsonify({"error": "Invalid QR ID format"}), 400
        
        # Check ownership
        qr_doc = mongo.db.qr_codes.find_one({
            "_id": obj_id,
            "farmerEmail": request.farmer_email
        })
        
        if not qr_doc:
            return jsonify({"error": "QR code not found or unauthorized"}), 404
        
        # Delete the document
        mongo.db.qr_codes.delete_one({"_id": obj_id})
        
        return jsonify({
            "success": True,
            "message": "QR code deleted successfully",
            "qrId": qr_id
        }), 200
    
    except Exception as e:
        print(f"Error in /api/qr/delete/{qr_id}: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/qr/update/<qr_id>", methods=["PUT"])
@require_farmer_token
def update_qr(qr_id):
    """Update a QR code (only by the farmer who created it)"""
    try:
        try:
            obj_id = ObjectId(qr_id)
        except InvalidId:
            return jsonify({"error": "Invalid QR ID format"}), 400
        
        # Check ownership
        qr_doc = mongo.db.qr_codes.find_one({
            "_id": obj_id,
            "farmerEmail": request.farmer_email
        })
        
        if not qr_doc:
            return jsonify({"error": "QR code not found or unauthorized"}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        update_fields = {}
        allowed_fields = [
            "productName", "quality", "additionalNotes", "price"
        ]
        
        for field in allowed_fields:
            if field in data:
                update_fields[field] = data[field]
        
        update_fields["updatedAt"] = datetime.utcnow().isoformat()
        
        # Update the document
        mongo.db.qr_codes.update_one(
            {"_id": obj_id},
            {"$set": update_fields}
        )
        
        # Fetch updated document
        updated_qr = mongo.db.qr_codes.find_one({"_id": obj_id})
        updated_qr["_id"] = str(updated_qr["_id"])
        
        return jsonify({
            "success": True,
            "message": "QR code updated successfully",
            "qrCode": updated_qr
        }), 200
    
    except Exception as e:
        print(f"Error in /api/qr/update/{qr_id}: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/qr/stats", methods=["GET"])
@require_farmer_token
def get_stats():
    """Get statistics for farmer's QR codes"""
    try:
        qr_codes = list(mongo.db.qr_codes.find(
            {"farmerEmail": request.farmer_email}
        ))
        
        total_qrs = len(qr_codes)
        total_scans = sum(qr.get("scans", 0) for qr in qr_codes)
        
        # Find most scanned QR
        most_scanned = max(qr_codes, key=lambda x: x.get("scans", 0)) if qr_codes else None
        
        return jsonify({
            "success": True,
            "stats": {
                "totalQRCodes": total_qrs,
                "totalScans": total_scans,
                "averageScansPerQR": total_scans // total_qrs if total_qrs > 0 else 0,
                "mostScannedProduct": most_scanned.get("productName") if most_scanned else None,
                "mostScannedCount": most_scanned.get("scans", 0) if most_scanned else 0
            }
        }), 200
    
    except Exception as e:
        print(f"Error in /api/qr/stats: {e}")
        return jsonify({"error": str(e)}), 500

# ========== HELPER FUNCTIONS ==========

def format_qr_text(data):
    """Format QR code data as human-readable text"""
    qr_text = "GrassRoots QR\n"
    qr_text += f"Product: {data.get('productName', 'N/A')}\n"
    qr_text += f"Type: {data.get('cropType', 'N/A')}\n"
    qr_text += f"Quality: {data.get('quality', 'N/A')}\n"
    qr_text += f"Harvest: {data.get('harvestDate', 'N/A')}\n"
    qr_text += f"Location: {data.get('farmLocation', 'N/A')}\n"
    qr_text += f"Fertilizer: {data.get('fertilizerUsed', 'N/A')}\n"
    qr_text += f"Pesticides: {data.get('pesticidesUsed', 'N/A')}\n"
    
    if data.get('batchNumber'):
        qr_text += f"Batch: {data.get('batchNumber')}\n"
    if data.get('price'):
        qr_text += f"Price: {data.get('price')}\n"
    
    qr_text += f"Generated: {datetime.now().strftime('%m/%d/%Y, %I:%M:%S %p')}"
    
    return qr_text

# ========== ERROR HANDLERS ==========

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

# ========== MAIN ==========

if __name__ == "__main__":
    print("Starting GrassRoots QR Backend...")
    app.run(
        host=os.getenv("FLASK_HOST", "127.0.0.1"),
        port=int(os.getenv("FLASK_PORT", 5000)),
        debug=os.getenv("FLASK_DEBUG", True)
    )
