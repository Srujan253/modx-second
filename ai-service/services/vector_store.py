import chromadb
from sentence_transformers import SentenceTransformer
from core.config import (
    EMBEDDING_MODEL, 
    CHROMA_API_KEY, 
    CHROMA_TENANT, 
    CHROMA_DATABASE
)

client = chromadb.CloudClient(
    tenant=CHROMA_TENANT,
    database=CHROMA_DATABASE,
    api_key=CHROMA_API_KEY
)

collection = client.get_or_create_collection("modx_knowledge_base")
embedding_model = SentenceTransformer(EMBEDDING_MODEL)

def add_documents_to_store(documents_with_metadata):
    """Adds documents with their metadata to Chroma Cloud."""
    if not documents_with_metadata: return

    ids = [item[0] for item in documents_with_metadata]
    documents = [item[1] for item in documents_with_metadata]
    metadatas = [item[2] for item in documents_with_metadata]
    
    embeddings = embedding_model.encode(documents)
    
    collection.upsert(
        embeddings=embeddings.tolist(),
        documents=documents,
        ids=ids,
        metadatas=metadatas # <-- Save the metadata
    )
    print(f"Successfully upserted {len(documents)} documents.")

def find_similar_document_ids(query_text: str, n_results=10) -> list[str]:
    """Finds the most semantically similar documents based on a query."""
    query_embedding = embedding_model.encode([query_text]).tolist()
    results = collection.query(
        query_embeddings=query_embedding,
        n_results=n_results,
        where={"doc_type": "project"} # Filter to only search for projects
    )
    return results['ids'][0]

def delete_document_from_store(doc_id: str):
    """Deletes a document by its ID from ChromaDB."""
    try:
        collection.delete(ids=[doc_id])
        print(f"✅ Deleted document {doc_id} from ChromaDB")
    except Exception as e:
        print(f"❌ Error deleting document {doc_id}: {e}")