# File: scripts/index_data.py
import sys
import os

# This adds the main project folder to the path so we can import other modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database import get_all_documents
from services.vector_store import add_documents_to_store

def main():
    print("Fetching live documents from the main database...")
    documents = get_all_documents()
    
    if documents:
        print(f"Found {len(documents)} documents. Adding them to the vector store...")
        add_documents_to_store(documents)
        print("Live data indexing complete!")
    else:
        print("No documents found in the database.")

if __name__ == "__main__":
    main()