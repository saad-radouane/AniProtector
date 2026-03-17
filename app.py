from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model
from PIL import Image, ImageOps
import numpy as np
import io
import base64
import os

app = Flask(__name__)
# Enable CORS for the frontend to communicate with localhost:5000
CORS(app)

# Disable scientific notation for clarity
np.set_printoptions(suppress=True)

MODEL_PATH = "keras_model.h5"
LABELS_PATH = "labels.txt"

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
            print("The /predict-reptile endpoint will return an error until they are provided.")
    except Exception as e:
        print(f"Error loading model: {e}")

# Initialize model on startup
initialize()

@app.route('/predict-reptile', methods=['POST'])
def predict_reptile():
    if model is None or not class_names:
        return jsonify({"error": "Model not loaded. Please ensure keras_model.h5 and labels.txt exist."}), 503

    try:
        data = request.json
        if not data or 'image' not in data:
            return jsonify({"error": "No image provided"}), 400

        # The frontend will send the image as a base64 Data URL
        # e.g., "data:image/jpeg;base64,/9j/4AAQ..."
        image_data = data['image']
        
        # Extract the base64 string
        if "," in image_data:
            base64_str = image_data.split(",")[1]
        else:
            base64_str = image_data
            
        # Decode base64 to bytes
        img_bytes = base64.b64decode(base64_str)
        
        # Load image via Pillow
        image = Image.open(io.BytesIO(img_bytes)).convert("RGB")

        # Create array of the right shape
        input_data = np.ndarray(shape=(1, 224, 224, 3), dtype=np.float32)

        # Resizing the image to be at least 224x224 and then cropping from the center
        size = (224, 224)
        image = ImageOps.fit(image, size, Image.Resampling.LANCZOS)

        # Turn image into a numpy array and normalize
        image_array = np.asarray(image)
        normalized_image_array = (image_array.astype(np.float32) / 127.5) - 1

        # Load the image into the input data array
        input_data[0] = normalized_image_array

        # Predict using the model
        prediction = model.predict(input_data)
        index = int(np.argmax(prediction[0]))
        
        # Get class name (stripping newline/index numbers typically found in labels.txt like "0 Class")
        raw_class_name = class_names[index]
        # the user's snippet did 'class_name[2:]' assuming format "0 Snake", let's handle it safely
        if len(raw_class_name) > 2 and raw_class_name[1] == " ":
             class_name = raw_class_name[2:].strip()
        else:
             class_name = raw_class_name.strip()
             
        confidence_score = float(prediction[0][index])
        
        print(f"Predicted reptile: {class_name} ({confidence_score * 100:.2f}%)")

        return jsonify({
            "success": True,
            "prediction": class_name,
            "confidence": confidence_score
        })

    except Exception as e:
        print(f"Error during prediction: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Run the Flask server on port 5000
    app.run(host='0.0.0.0', port=5000, debug=False)
