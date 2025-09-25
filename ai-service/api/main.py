# File: api/main.py
from fastapi import FastAPI
from pydantic import BaseModel
from core import orchestrator

app = FastAPI()

class ChatQuery(BaseModel):
    query: str

@app.post("/chat")
def chat_endpoint(chat_query: ChatQuery):
    """Receives a user query and returns an AI-generated answer."""
    answer = orchestrator.process_query(chat_query.query)
    return {"answer": answer}