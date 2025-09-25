# File: services/vector_store.py
import chromadb
from sentence_transformers import SentenceTransformer
from core.config import (
    EMBEDDING_MODEL, 
    CHROMA_API_KEY, 
    CHROMA_TENANT, 
    CHROMA_DATABASE
)
import uuid

client = chromadb.CloudClient(
    tenant=CHROMA_TENANT,
    database=CHROMA_DATABASE,
    api_key=CHROMA_API_KEY
)

collection = client.get_or_create_collection("modx_knowledge_base")
embedding_model = SentenceTransformer(EMBEDDING_MODEL)

def add_documents_to_store(documents):
    """Converts a list of text documents to embeddings and adds them to Chroma Cloud with unique IDs."""
    if not documents:
        print("No documents to add.")
        return
        
    embeddings = embedding_model.encode(documents)
    ids = [str(uuid.uuid4()) for _ in documents]
    
    collection.add(
        embeddings=embeddings.tolist(),
        documents=documents,
        ids=ids
    )
    print(f"Successfully added {len(documents)} documents to Chroma Cloud.")

# --- THIS IS THE FIX ---
# Renamed the function to match what llm_service.py is calling
def find_similar_documents(query_text: str, n_results=3) -> str:
    """Finds the most semantically similar documents for a given conceptual query."""
    query_embedding = embedding_model.encode([query_text]).tolist()
    results = collection.query(
        query_embeddings=query_embedding,
        n_results=n_results
    )
    
    # Return the results as a single string of context
    return "\n".join(results['documents'][0])