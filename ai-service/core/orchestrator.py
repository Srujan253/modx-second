# File: core/orchestrator.py
from core import llm_service

def process_query(query):
    """
    The orchestrator's only job is to start the process.
    The LLM service will handle the decision-making.
    """
    print(f"Orchestrator: Passing query '{query}' to the LLM service.")
    return llm_service.generate_answer(query)