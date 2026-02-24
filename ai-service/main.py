from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import logging

from services import vector_store
from services import vector_indexer
from services.vector_store import delete_document_from_store
from core import orchestrator

# Initialize Logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="MODX AI Service")

# Request/Response Models
class ChatRequest(BaseModel):
    query: str

class ChatResponse(BaseModel):
    answer: str

class RecommendationRequest(BaseModel):
    query_text: str

class RecommendationResponse(BaseModel):
    recommended_ids: List[str]

class SearchRequest(BaseModel):
    search_query: str

class IndexResponse(BaseModel):
    status: str

class DeleteRequest(BaseModel):
    project_id: str

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        logger.info(f"Received query: '{request.query}'")
        answer_text = orchestrator.process_query(request.query)
        return ChatResponse(answer=answer_text)
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        return ChatResponse(answer="An error occurred in the AI service.")

@app.post("/recommendations", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest):
    try:
        doc_ids = vector_store.find_similar_document_ids(request.query_text, n_results=10)
        return RecommendationResponse(recommended_ids=doc_ids)
    except Exception as e:
        logger.error(f"Error in recommendations endpoint: {e}")
        return RecommendationResponse(recommended_ids=[])

@app.post("/related-projects", response_model=RecommendationResponse)
async def get_related_projects(request: RecommendationRequest):
    try:
        doc_ids = vector_store.find_similar_document_ids(request.query_text, n_results=6)
        return RecommendationResponse(recommended_ids=doc_ids)
    except Exception as e:
        logger.error(f"Error in related-projects endpoint: {e}")
        return RecommendationResponse(recommended_ids=[])

@app.post("/search-projects", response_model=RecommendationResponse)
async def search_projects(request: SearchRequest):
    try:
        doc_ids = vector_store.find_similar_document_ids(request.search_query, n_results=6)
        return RecommendationResponse(recommended_ids=doc_ids)
    except Exception as e:
        logger.error(f"Error in search-projects endpoint: {e}")
        return RecommendationResponse(recommended_ids=[])

@app.post("/index-new-data", response_model=IndexResponse)
async def index_new_data():
    try:
        result = vector_indexer.index_new_data()
        return IndexResponse(status=result)
    except Exception as e:
        logger.error(f"Error in index-new-data endpoint: {e}")
        return IndexResponse(status=f"Error: {str(e)}")

@app.delete("/project/{project_id}")
async def delete_project_from_index(project_id: str):
    try:
        doc_id = f"project_{project_id}"
        delete_document_from_store(doc_id)
        return {"message": f"Deleted {doc_id} from index"}
    except Exception as e:
        logger.error(f"Error in delete endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=50051, reload=False)

