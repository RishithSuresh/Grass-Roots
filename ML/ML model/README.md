# ML model — prediction endpoint

This folder contains scripts used for crop price prediction.

Files:
- `xgboost_model.py` — training script (example; trains a model if you run it locally)
- `predict.py` — CLI predictor used by the backend. Reads JSON from stdin and outputs JSON to stdout.
- `requirements.txt` — Python packages needed (install into a virtualenv)

Quick start:
1. Create a Python virtual environment and install dependencies:
   python -m venv .venv
   .\.venv\Scripts\activate
   pip install -r requirements.txt

2. Train a model (optional):
   Update `xgboost_model.py` data paths and run it to produce `xgboost_model.pkl` in this folder.

3. Run the backend (Node):
   - From the repository root:
     cd backend
     npm install
     npm start

   The backend exposes a new API endpoint:
     POST /api/ml/predict

   Body example (recommended):
   {
     "crop": "Tomato",
     "location": "Bangalore"
   }

   Backend behavior: When only `crop` and `location` are provided, the backend will look up the latest record in the `market_prices` table and use the DB's `modal_price` and `price_change_percentage` as prediction features. If `xgboost_model.pkl` is present it will be used; otherwise a simple heuristic fallback prediction is returned.

Notes / next steps:
- For production, consider running a dedicated model server (Flask/FastAPI) and add robust input validation and feature construction.
- Keep model I/O and feature engineering in sync with the training script (`xgboost_model.py`).
