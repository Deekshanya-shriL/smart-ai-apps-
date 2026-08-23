import pandas as pd
import joblib

from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, mean_absolute_error


# ==========================================
# 1. LOAD DATASET
# ==========================================

DATA_PATH = "data/training_data.csv"

data = pd.read_csv(DATA_PATH)

print("\nDataset loaded successfully!")
print(f"Number of samples: {len(data)}")


# ==========================================
# 2. DEFINE INPUT FEATURES
# ==========================================

features = [
    "temperature_c",
    "humidity_percent",
    "storage_days",
    "initial_quality"
]

X = data[features]


# ==========================================
# 3. SPOILAGE RISK CLASSIFICATION MODEL
# ==========================================

y_class = data["spoilage_risk"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y_class,
    test_size=0.2,
    random_state=42,
    stratify=y_class
)

classifier = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)

classifier.fit(X_train, y_train)

predictions = classifier.predict(X_test)

accuracy = accuracy_score(y_test, predictions)

print("\n===================================")
print("SPOILAGE CLASSIFICATION MODEL")
print("===================================")
print(f"Accuracy: {accuracy * 100:.2f}%")


# Save classification model

joblib.dump(
    classifier,
    "AI_Model/spoilage_classifier.pkl"
)

print("Classification model saved!")


# ==========================================
# 4. FRESHNESS SCORE REGRESSION MODEL
# ==========================================

y_freshness = data["freshness_score"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y_freshness,
    test_size=0.2,
    random_state=42
)

regressor = RandomForestRegressor(
    n_estimators=100,
    random_state=42
)

regressor.fit(X_train, y_train)

freshness_predictions = regressor.predict(X_test)

mae = mean_absolute_error(
    y_test,
    freshness_predictions
)

print("\n===================================")
print("FRESHNESS SCORE MODEL")
print("===================================")
print(f"Mean Absolute Error: {mae:.2f}")


# Save regression model

joblib.dump(
    regressor,
    "AI_Model/freshness_regressor.pkl"
)

print("Freshness model saved!")


# ==========================================
# 5. FINISHED
# ==========================================

print("\n===================================")
print("AI TRAINING COMPLETED SUCCESSFULLY!")
print("===================================")

print("\nGenerated files:")

print("✓ AI_Model/spoilage_classifier.pkl")
print("✓ AI_Model/freshness_regressor.pkl")