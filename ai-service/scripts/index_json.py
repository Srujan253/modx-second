# File: scripts/index_json.py
import sys
import os
import json

# --- THIS IS THE FIX ---
# This code adds the main project folder ('ai-service') to Python's path,
# so it can find the 'services' and 'core' folders.
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Now the import will work correctly
from services.vector_store import add_documents_to_store

# Make sure you create this JSON file in your project's root directory
JSON_FILE_PATH = "modx_knowledge_base.json" 

def load_documents_from_json(file_path):
    """Loads and formats documents from your static JSON file."""
    try:
        with open(file_path, 'r') as f:
            knowledge_data = json.load(f)
        
        documents = [f"Title: {item['title']}. Content: {item['content']}" for item in knowledge_data]
        return documents
    except FileNotFoundError:
        print(f"Error: The file was not found at {file_path}")
        return []
    except json.JSONDecodeError:
        print(f"Error: The file at {file_path} is not a valid JSON file.")
        return []

def main():
    print(f"Reading static knowledge from {JSON_FILE_PATH}...")
    documents = load_documents_from_json(JSON_FILE_PATH)
    
    if documents:
        print("Adding static documents to the vector store...")
        add_documents_to_store(documents)
        print("Static JSON data indexing complete!")
    else:
        print("No documents found in the JSON file.")

if __name__ == "__main__":
    main()