import os
import json
import pandas as pd
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report

# =========================
# Paths
# =========================

base_dir = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

intents_path = os.path.join(
    base_dir,
    "data",
    "intents.json"
)

models_dir = os.path.join(
    base_dir,
    "models"
)

os.makedirs(models_dir, exist_ok=True)

print(f"\nLoading dataset from:\n{intents_path}")

# =========================
# Load JSON Dataset
# =========================

with open(
    intents_path,
    "r",
    encoding="utf-8"
) as file:

    data = json.load(file)

# =========================
# Extract Data
# =========================

texts = []
labels = []

for intent in data["intents"]:

    for pattern in intent["patterns"]:

        texts.append(pattern.lower())
        labels.append(intent["tag"])

# =========================
# Create DataFrame
# =========================

df = pd.DataFrame({
    "text": texts,
    "intent": labels
})

print("\n--- Dataset Preview ---")
print(df.head())

print(f"\nTotal Training Samples: {len(df)}")

print("\nIntent Counts:\n")
print(df["intent"].value_counts())

# =========================
# Features & Target
# =========================

X = df["text"]
y = df["intent"]

# =========================
# TF-IDF
# =========================

vectorizer = TfidfVectorizer(
    lowercase=True,
    ngram_range=(1, 2),
    stop_words="english"
)

X_vec = vectorizer.fit_transform(X)

# =========================
# Train-Test Split
# =========================

X_train, X_test, y_train, y_test = train_test_split(
    X_vec,
    y,
    test_size=0.2,
    random_state=42
)

print(f"\nTraining Samples: {len(y_train)}")
print(f"Testing Samples: {len(y_test)}")

# =========================
# Train Model
# =========================

model = LogisticRegression(
    max_iter=2000,
    random_state=42
)

model.fit(
    X_train,
    y_train
)

# =========================
# Prediction
# =========================

y_pred = model.predict(X_test)

# =========================
# Evaluation
# =========================

accuracy = accuracy_score(
    y_test,
    y_pred
)

print("\n" + "=" * 50)
print(f"Validation Accuracy: {accuracy:.2f}")
print("=" * 50)

print("\nClassification Report:\n")

print(
    classification_report(
        y_test,
        y_pred,
        zero_division=0
    )
)

# =========================
# Save Model
# =========================

model_path = os.path.join(
    models_dir,
    "chatbot_model.pkl"
)

vectorizer_path = os.path.join(
    models_dir,
    "vectorizer.pkl"
)

joblib.dump(
    model,
    model_path
)

joblib.dump(
    vectorizer,
    vectorizer_path
)

print("\nModel Saved Successfully:")
print(model_path)

print("\nVectorizer Saved Successfully:")
print(vectorizer_path)

print("\n✅ Training Complete!")