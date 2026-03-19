from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from tensorflow.keras.models import load_model
from PIL import Image, ImageOps
import numpy as np
import io
import base64
import os
import requests as http_requests

app = Flask(__name__)
# Enable CORS for the frontend to communicate with localhost:5000
CORS(app)

# Disable scientific notation for clarity
np.set_printoptions(suppress=True)

MODEL_PATH = "keras_model.h5"
LABELS_PATH = "labels.txt"

# ---------------------------------------------------------------------------
# Database Server (separate SQL web server on port 5001)
# Run:  cd ../db_server && python server.py
# On AWS: set DB_SERVER_URL=http://<db-ec2-ip>:5001
# ---------------------------------------------------------------------------
DB_SERVER_URL = os.environ.get('DB_SERVER_URL', 'http://localhost:5001')

model = None
class_names = []

def initialize():
    global model, class_names
    try:
        if os.path.exists(MODEL_PATH) and os.path.exists(LABELS_PATH):
            print(f"Loading Keras model from {MODEL_PATH}...")
            # compile=False since we are only inferencing, not training
            model = load_model(MODEL_PATH, compile=False)

            print(f"Loading labels from {LABELS_PATH}...")
            with open(LABELS_PATH, "r") as f:
                class_names = f.readlines()
            print("Model and labels loaded successfully.")
        else:
            print(f"WARNING: Model files ({MODEL_PATH} or {LABELS_PATH}) not found.")
    except Exception as e:
        print(f"Error loading model: {e}")

# Initialize model on startup
initialize()


# ---------------------------------------------------------------------------
# Helper: run prediction on a PIL Image
# ---------------------------------------------------------------------------
def run_prediction(image: Image.Image):
    if model is None or not class_names:
        return None, None

    size = (224, 224)
    image = ImageOps.fit(image, size, Image.Resampling.LANCZOS)
    image_array = np.asarray(image)
    normalized = (image_array.astype(np.float32) / 127.5) - 1

    input_data = np.ndarray(shape=(1, 224, 224, 3), dtype=np.float32)
    input_data[0] = normalized

    prediction = model.predict(input_data)
    index = int(np.argmax(prediction[0]))

    raw = class_names[index]
    class_name = raw[2:].strip() if len(raw) > 2 and raw[1] == " " else raw.strip()
    confidence = float(prediction[0][index])

    return class_name, confidence


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route('/predict-reptile', methods=['POST'])
def predict_reptile():
    """Classify an image uploaded by the user (base64 Data URL)."""
    if model is None or not class_names:
        return jsonify({"error": "Model not loaded."}), 503

    try:
        data = request.json
        if not data or 'image' not in data:
            return jsonify({"error": "No image provided"}), 400

        image_data = data['image']
        base64_str = image_data.split(",")[1] if "," in image_data else image_data
        img_bytes  = base64.b64decode(base64_str)
        image      = Image.open(io.BytesIO(img_bytes)).convert("RGB")

        class_name, confidence = run_prediction(image)
        if class_name is None:
            return jsonify({"error": "Prediction failed"}), 500

        print(f"[upload] {class_name} ({confidence * 100:.2f}%)")
        return jsonify({"success": True, "prediction": class_name, "confidence": confidence})

    except Exception as e:
        print(f"Error during prediction: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/predict-webcam', methods=['POST'])
def predict_webcam():
    """
    Classify a single webcam frame sent as a base64 JPEG Data URL.
    The frontend captures a frame via canvas.toDataURL() and POSTs it here.
    """
    if model is None or not class_names:
        return jsonify({"error": "Model not loaded."}), 503

    try:
        data = request.json
        if not data or 'frame' not in data:
            return jsonify({"error": "No frame provided"}), 400

        frame_data = data['frame']
        base64_str = frame_data.split(",")[1] if "," in frame_data else frame_data
        img_bytes  = base64.b64decode(base64_str)
        image      = Image.open(io.BytesIO(img_bytes)).convert("RGB")

        class_name, confidence = run_prediction(image)
        if class_name is None:
            return jsonify({"error": "Prediction failed"}), 500

        print(f"[webcam] {class_name} ({confidence * 100:.2f}%)")
        return jsonify({"success": True, "prediction": class_name, "confidence": confidence})

    except Exception as e:
        print(f"Error during webcam prediction: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/status', methods=['GET'])
def get_status():
    """
    Proxy conservation status lookup to the dedicated SQL database server (port 5001).
    """
    query_name = request.args.get('animal', '').lower()
    if not query_name:
        return jsonify({"error": "No animal species provided"}), 400

    try:
        resp = http_requests.get(
            f"{DB_SERVER_URL}/api/status?animal={query_name}",
            timeout=5
        )
        return jsonify(resp.json()), resp.status_code
    except Exception as e:
        print(f"DB server unreachable: {e}")
        return jsonify({"error": "Database server unavailable"}), 503


if __name__ == '__main__':
    # Run the main API server on port 5000
    app.run(host='0.0.0.0', port=5000, debug=False)
