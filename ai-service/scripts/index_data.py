import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database import get_all_documents_with_metadata # <-- Use the new function name
from services.vector_store import add_documents_to_store

def main():
    print("Fetching documents with metadata...")
    documents = get_all_documents_with_metadata()
    
    if documents:
        print(f"Found {len(documents)} documents. Adding them to the vector store...")
        add_documents_to_store(documents)
        print("Live data indexing complete!")
    else:
        print("No documents found in the database.")

if __name__ == "__main__":
    main()
