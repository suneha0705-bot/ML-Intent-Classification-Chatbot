import os
import json
import random
import joblib
import streamlit as st

# =========================
# Page Config
# =========================

st.set_page_config(
    page_title="ML Chatbot",
    page_icon="🤖"
)

st.title("🤖 ML Intent Classification Chatbot")

# =========================
# Paths
# =========================

base_dir = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

# =========================
# Load Model
# =========================

model = joblib.load(
    os.path.join(
        base_dir,
        "models",
        "chatbot_model.pkl"
    )
)

vectorizer = joblib.load(
    os.path.join(
        base_dir,
        "models",
        "vectorizer.pkl"
    )
)

# =========================
# Load Dataset
# =========================

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

# =========================
# Session State
# =========================

if "messages" not in st.session_state:

    st.session_state.messages = []

# =========================
# Display Previous Messages
# =========================

for message in st.session_state.messages:

    with st.chat_message(
        message["role"]
    ):

        st.write(
            message["content"]
        )

# =========================
# User Input
# =========================

user_input = st.chat_input(
    "Type your message..."
)

# =========================
# Chat Logic
# =========================

if user_input:

    # Show user message
    st.session_state.messages.append(
        {
            "role": "user",
            "content": user_input
        }
    )

    # Convert text to vector
    user_vector = vectorizer.transform(
        [user_input]
    )

    # Predict intent
    predicted_intent = model.predict(
        user_vector
    )[0]

    # Default response
    response = (
        "Sorry, I don't understand."
    )

    # Find matching response
    for intent in data["intents"]:

        if intent["tag"] == predicted_intent:

            response = random.choice(
                intent["responses"]
            )

            break

    # Store bot response
    st.session_state.messages.append(
        {
            "role": "assistant",
            "content": response
        }
    )

    st.rerun()