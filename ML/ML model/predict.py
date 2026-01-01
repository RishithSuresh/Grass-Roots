#!/usr/bin/env python3
"""Simple CLI predictor used by backend.
Reads a JSON object from stdin and writes a JSON result to stdout.
If a trained model file (`xgboost_model.pkl`) exists in this folder, it will be used.
Otherwise the script returns a simple heuristic prediction.

Input example (stdin):
{ "crop": "Tomato", "location": "Bangalore", "currentPrice": 3500, "change": 5.2 }

Output example (stdout):
{ "predictedPrice": 3685, "model": "xgboost" }
"""
import sys
import json
import os
from pathlib import Path

def fallback_prediction(payload):
    # Simple fallback: adjust by `change` percent if available
    cp = payload.get('currentPrice', 0)
    change = payload.get('change', 0)
    try:
        predicted = round(cp * (1 + (change or 0) / 100))
    except Exception:
        predicted = round(cp)
    return { 'predictedPrice': predicted, 'model': 'fallback' }


def main():
    try:
        payload = json.load(sys.stdin)
    except Exception as e:
        print(json.dumps({ 'error': 'Invalid input', 'details': str(e) }))
        sys.exit(1)

    model_path = Path(__file__).parent / 'xgboost_model.pkl'
    if model_path.exists():
        try:
            # Lazy import to avoid requiring packages if not present
            import joblib
            import numpy as np

            model = joblib.load(str(model_path))

            # Build features — for now we support a minimal feature vector.
            # If you trained with a different schema, update this section accordingly.
            # Default features: [currentPrice, change]
            cp = float(payload.get('currentPrice', 0))
            ch = float(payload.get('change', 0))
            features = np.array([[cp, ch]])

            pred = model.predict(features)
            pred_value = int(round(float(pred[0])))
            print(json.dumps({ 'predictedPrice': pred_value, 'model': 'xgboost' }))
            return
        except Exception as e:
            # Fall back when model load or predict fails
            print(json.dumps({ 'error': 'Model prediction failed', 'details': str(e) }))
            sys.exit(2)

    # No model — return fallback
    print(json.dumps(fallback_prediction(payload)))

if __name__ == '__main__':
    main()
