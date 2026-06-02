import os
import json
import random
import joblib

# Base directory
base_dir = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

# Load model
model = joblib.load(
    os.path.join(
        base_dir,
        "models",
        "chatbot_model.pkl"
    )
)

# Load vectorizer
vectorizer = joblib.load(
    os.path.join(
        base_dir,
        "models",
        "vectorizer.pkl"
    )
)

# Load intents.json
with open(
    os.path.join(
        base_dir,
        "data",
        "intents.json"
    ),
    "r",
    encoding="utf-8"
) as file:

    data = json.load(file)

print("🤖 Chatbot Started")
print("Type 'exit' to quit\n")

while True:

    user = input("You: ")

    if user.lower() == "exit":
        print("Bot: Goodbye!")
        break

    # Convert user text
    user_vector = vectorizer.transform(
        [user]
    )

    # Predict intent
    predicted_intent = model.predict(
        user_vector
    )[0]

    # Find response
    for intent in data["intents"]:

        if intent["tag"] == predicted_intent:

            print(
                "Bot:",
                random.choice(
                    intent["responses"]
                )
            )

            break