# AniProtector

**AniProtector** is an AI-powered web app that identifies animals from photos and shows their conservation status according to the IUCN Red List. Users can upload an image or capture one with their camera. The app then reports the most likely species, a confidence score, and a conservation status with a short description.

The project supports the global goal of ending poaching and trafficking of protected species (SDG Target 15.7).

## Features

- **Image upload** by drag & drop or file browser.
- **Live camera capture** from the device webcam (requires HTTPS on most devices).
- **Species identification** with a confidence percentage.
- **Conservation status** (Extinct to Least Concern) with a colour-coded badge and a short factual description.
- **Reptile classifier** served by a custom Keras model, with a browser-based fallback for everything else.
- **Graceful degradation:** if the Python backend is offline, the web app keeps working using the in-browser model.

## How It Works

1. The user provides an image, either uploaded or captured from the camera.
2. The frontend tries the Python backend first. The backend runs a custom Keras model (trained with Google Teachable Machine) on reptile images and returns the predicted label and confidence.
3. If the backend is unavailable, the frontend classifies the image in the browser with TensorFlow.js and MobileNet.
4. The species name is matched against a local IUCN dictionary (`data.js`, `app.js`). The app can also query a separate database server through the Flask API, and fall back to Wikipedia summaries when no local match exists.
5. The result card shows the species, the confidence, and the conservation status.

## Architecture

```
Browser (index_1.html, app.js, style.css)
   │
   ├── TensorFlow.js + MobileNet   (in-browser fallback)
   │
   └── Flask API  (app.py, port 5000)
          ├── POST /predict-reptile   → Keras model (keras_model.h5 + labels.txt)
          ├── POST /predict-webcam    → Keras model, single camera frame
          └── GET  /api/status        → proxy to database server (port 5001)
                                          └── SQLite database, exposed via a web API
```

| Component | Technology |
|---|---|
| Frontend | HTML, CSS, vanilla JavaScript |
| In-browser AI | TensorFlow.js, MobileNet |
| Backend | Python, Flask, Flask-CORS |
| Custom model | Keras / TensorFlow, Google Teachable Machine |
| Image handling | Pillow, NumPy, base64 |
| Database | SQLite, served through a web API |
| Hosting | AWS EC2, ngrok (secure HTTPS tunnel) |

## Repository Contents

| File | Purpose |
|---|---|
| `index_1.html` | Main page: upload area, camera view, results panel |
| `app.js` | Frontend logic: image handling, classification, status lookup, UI updates |
| `style.css` | Dark glassmorphism theme and status colour coding |
| `app.py` | Flask backend: prediction endpoints and database proxy |
| `keras_model.h5` | Trained reptile classifier (Teachable Machine export, 224×224 input) |
| `labels.txt` | Class labels for the reptile model |
| `data.js` | Local IUCN species dictionary |
| `Conservation_status.txt` | Reference list of species grouped by IUCN category |
| `Reptiles_model.txt` | Standalone Python example for testing the model on a single image |
| `Instructions.txt` | Setup and testing instructions |
| `Presentation.pdf` | Project presentation |

## Reptile Classes

The custom model recognises 12 reptile and reptile-related classes:

Turtle, Crocodile, Lizard, Iguana, Gecko, Chameleon, Skink, Snake, Mamba, Anaconda, Viper, Boa.

## Getting Started

### Prerequisites

- Python 3.9+
- A modern web browser

### 1. Start the Python backend

Place `keras_model.h5` and `labels.txt` in the project folder, then:

```bash
pip install flask flask-cors tensorflow pillow numpy
python app.py
```

The API runs on `http://localhost:5000`.

### 2. Start the frontend

In a second terminal, from the project folder:

```bash
python -m http.server 8000
```

Open `http://localhost:8000/` in your browser.

### 3. Test

- Upload a reptile photo. The backend terminal shows the processing log, and the result appears in the app.
- Stop the Python server and upload again. The app switches to the in-browser MobileNet model without breaking.

## Database Server

The status lookup uses a separate database service that runs on port 5001. Start it from its own folder and point the backend to it with an environment variable:

```bash
DB_SERVER_URL=http://localhost:5001 python app.py
```

On AWS, set `DB_SERVER_URL=http://<db-ec2-ip>:5001`.

> Note: the database server code is not included in this repository snapshot.

## Deployment

The app was hosted on an **AWS EC2** instance. Because browsers only allow camera access over HTTPS, the site was exposed through an **ngrok** secure tunnel. In `app.js`, `API_BASE_URL` is set to `localhost:5000` for local development. For deployment, replace it with your EC2 public address.

## Limitations

- The custom classifier covers reptiles only. Other animals rely on the general-purpose MobileNet model, which is not trained specifically for wildlife.
- Confidence scores reflect model certainty, not guaranteed accuracy.
- Conservation data is a static snapshot of the IUCN Red List and may be out of date. Always check the official IUCN site for current assessments.

## Team

Saad Radouane & Dariush Noori
