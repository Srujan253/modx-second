from database import get_new_or_updated_documents, mark_as_indexed
from services.vector_store import add_documents_to_store


def index_new_data():
    """Index new or updated documents from MongoDB into the vector store"""
    documents = get_new_or_updated_documents()
    if not documents:
        return "No new documents to index."

    add_documents_to_store(documents)

    # Extract project and user IDs from document IDs
    project_ids = [d[0].split("_")[1] for d in documents if d[0].startswith("project_")]
    user_ids = [d[0].split("_")[1] for d in documents if d[0].startswith("user_")]

    # Mark as indexed in MongoDB
    if project_ids:
        mark_as_indexed(project_ids, "projects")
    if user_ids:
        mark_as_indexed(user_ids, "users")

    return f"Indexed {len(documents)} documents."
