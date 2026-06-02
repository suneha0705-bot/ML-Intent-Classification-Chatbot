import re

def clean_text(text):
    """
    Cleans raw text for optimal intent classification.
    Lowercases, removes special characters, and strips extra spaces.
    """
    if not isinstance(text, str):
        return ""
    
    # Convert to lowercase
    text = text.lower()
    
    # Remove special characters / punctuation except alphanumeric and spaces
    text = re.sub(r"[^a-zA-Z0-9\s]", "", text)
    
    # Replace multiple spaces with a single space
    text = re.sub(r"\s+", " ", text).strip()
    
    return text
