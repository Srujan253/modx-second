"""
Test MongoDB connection for AI service
"""
from database import get_mongodb_connection, get_new_or_updated_documents

try:
    print("Testing MongoDB connection...")
    db = get_mongodb_connection()
    
    # Test connection by listing collections
    collections = db.list_collection_names()
    print(f"✓ Connected to MongoDB successfully!")
    print(f"  Available collections: {collections}")
    
    # Test fetching documents
    print("\nTesting document fetch...")
    documents = get_new_or_updated_documents()
    print(f"✓ Found {len(documents)} documents to index")
    
    if documents:
        print("\nSample documents:")
        for doc_id, doc_text, metadata in documents[:3]:
            print(f"  - {doc_id}: {doc_text[:100]}...")
    
    print("\n✅ AI Service MongoDB migration successful!")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
