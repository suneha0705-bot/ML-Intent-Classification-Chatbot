from chatbot import IntentChatbot

def main():
    print("====================================================")
    print("      Machine Learning Intent Chatbot Console       ")
    print("====================================================")
    print("Loading AI model...")
    
    chatbot = IntentChatbot()
    
    if not chatbot.trained:
        print("[ERROR] Model or vectorizer not found!")
        print("Please train the model first by running: python src/train.py")
        return
        
    print("AI Model loaded successfully! Type 'exit' or 'quit' to end.")
    print("Chatbot is ready. Try typing a greeting or asking for a joke!")
    print("-" * 52)
    
    while True:
        try:
            user_input = input("\nYou: ").strip()
            if user_input.lower() in ["exit", "quit"]:
                print("Chatbot: Goodbye!")
                break
                
            if not user_input:
                continue
                
            response, tag, confidence = chatbot.get_response(user_input)
            
            print(f"Chatbot: {response}")
            print(f"[Debug] Predicted Intent: '{tag}' | Confidence: {confidence:.2%}")
            
        except (KeyboardInterrupt, EOFError):
            print("\nChatbot: Goodbye!")
            break

if __name__ == "__main__":
    main()
