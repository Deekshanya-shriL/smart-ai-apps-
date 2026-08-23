from flask import Flask, render_template, jsonify
import random
import joblib
import os


# ============================================================
# CREATE FLASK APPLICATION
# ============================================================

app = Flask(__name__)


# ============================================================
# AI MODEL PATHS
# ============================================================

CLASSIFIER_PATH = os.path.join(
    "AI_Model",
    "spoilage_classifier.pkl"
)

REGRESSOR_PATH = os.path.join(
    "AI_Model",
    "freshness_regressor.pkl"
)


# ============================================================
# LOAD TRAINED AI MODELS
# ============================================================

classifier = joblib.load(CLASSIFIER_PATH)

regressor = joblib.load(REGRESSOR_PATH)


print("==========================================")
print(" SMART FOOD SPOILAGE PREDICTOR")
print("==========================================")
print("AI Classification Model : LOADED")
print("Freshness Model         : LOADED")
print("Sensor Mode             : SIMULATION")
print("==========================================")


# ============================================================
# HOME PAGE
# ============================================================

@app.route("/")
def home():

    return render_template(
        "index.html"
    )


# ============================================================
# REAL-TIME AI PREDICTION API
# ============================================================

@app.route("/api/predict", methods=["GET"])
def predict():

    # --------------------------------------------------------
    # SIMULATED REAL-TIME SENSOR VALUES
    # --------------------------------------------------------
    # These values will later be replaced by Arduino/ESP32
    # sensor readings.
    # --------------------------------------------------------

    temperature = round(
        random.uniform(22, 36),
        1
    )

    humidity = round(
        random.uniform(55, 95),
        1
    )

    storage_days = round(
        random.uniform(1, 10),
        1
    )

    initial_quality = round(
        random.uniform(85, 100),
        1
    )


    # --------------------------------------------------------
    # PREPARE INPUT FOR AI MODEL
    # --------------------------------------------------------

    features = [[
        temperature,
        humidity,
        storage_days,
        initial_quality
    ]]


    # --------------------------------------------------------
    # SPOILAGE RISK PREDICTION
    # --------------------------------------------------------

    spoilage_prediction = classifier.predict(
        features
    )[0]


    # --------------------------------------------------------
    # AI CONFIDENCE
    # --------------------------------------------------------

    try:

        probabilities = classifier.predict_proba(
            features
        )[0]

        confidence = max(
            probabilities
        ) * 100

    except Exception:

        confidence = 75.0


    # --------------------------------------------------------
    # FRESHNESS SCORE PREDICTION
    # --------------------------------------------------------

    freshness_prediction = regressor.predict(
        features
    )[0]


    # Keep score between 0 and 100

    freshness_prediction = max(
        0,
        min(
            100,
            float(freshness_prediction)
        )
    )


    # --------------------------------------------------------
    # CREATE API RESPONSE
    # --------------------------------------------------------

    result = {

        "temperature":
            temperature,

        "humidity":
            humidity,

        "storage_days":
            storage_days,

        "initial_quality":
            initial_quality,

        "spoilage_risk":
            str(spoilage_prediction),

        "confidence":
            round(
                confidence,
                2
            ),

        "freshness_score":
            round(
                freshness_prediction,
                2
            )

    }


    return jsonify(result)


# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":

    app.run(

        debug=True,

        host="127.0.0.1",

        port=5000

    )