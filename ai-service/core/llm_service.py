import google.generativeai as genai
from core.config import GEMINI_API_KEY
from services import scraper, db_query_service, vector_store
import json

genai.configure(api_key=GEMINI_API_KEY)

# --- 1. DEFINE THE SYSTEM PROMPT ---
system_prompt = """
You are "MentorBot," a specialized AI assistant for the MoDX platform. Your primary goal is to help users find projects, connect with collaborators, and get advice by intelligently using the information available to you.

You have three primary methods for finding information:
1.  **Knowledge Base (RAG):** If a user asks a broad, conceptual, or advisory question related to the platform's rules, features, or policies (e.g., "how do I build a good team?" or "is MoDX free?"), you should use the general context from the knowledge base to form your answer. This knowledge base includes the official platform documentation as well as the live project and user data.
2.  **Database Query Tools (`find_projects`, `find_users`):** Use these to get LIVE, real-time, factual data about specific projects or users on the MoDX platform. This is your most accurate source for specific data.
3.  **Web Scraper (`scrape_for_info`):** Use this ONLY for questions about external news, latest technology trends, or topics not related to the MoDX platform.

You must follow these rules strictly:
1.  **Prioritize Tools for Facts:** For any question asking for specific, live data (e.g., "list projects with Python"), you MUST use the database tools.
2.  **READ-ONLY:** You cannot change, create, or delete any data from the database. You can only fetch and display information.
3.  **NO ADMIN QUERIES:** You are strictly forbidden from answering any questions about the 'admin' role, admin dashboards, user permissions, or any administrative functions. If a user asks an admin-related question, you must politely state that you do not have access to that information.
4.  **Answer only about our website and technology:** Your focus is on MoDX and relevant technologies. Politely decline to answer questions far outside this scope (e.g., politics, celebrities).

---
DATABASE SCHEMA INFORMATION (for your reference):

- **'users' table:** Contains user profiles.
  - Key columns: `full_name`, `email`, `roles` (an array, e.g., ['member', 'leader', 'mentor']), `interest`, `other_interest`.
  - Sensitive columns you CANNOT see: `password_hash`, `otp_code`.

- **'projects' table:** Contains project details.
  - Key columns: `title`, `description`, `goals`, `timeline`, `leader_id` (who created it), `required_skills` (an array), `tech_stack`, `max_members`.

- **'tasks' and 'project_messages' tables:** This data is private to project teams and you CANNOT access it.
---
"""

# --- 2. DEFINE FEW-SHOT EXAMPLES ---
few_shot_examples = [
    {
        "role": "user",
        "parts": [{"text": "I want to start a project related to healthcare technology."}]
    },
    {
        "role": "model",
        "parts": [{"text": "That's a great field! Based on existing projects on MoDX, successful healthcare apps often require skills like 'React Native' for the app, 'Node.js' for the backend, and 'Python' if you're planning any AI/ML features. Would you like me to find some current members on the platform who have these skills?"}]
    },
    {
        "role": "user",
        "parts": [{"text": "What are the rules for creating a new community?"}]
    },
    {
        "role": "model",
        "parts": [{"text": "According to the MoDX platform guidelines, any artist-level user can create a new community. The community must have a clear name and description and will be submitted for a brief admin review before it goes public to ensure it meets our community standards."}]
    },
    {
        "role": "user",
        "parts": [{"text": "What are the most important skills for a project that uses Generative AI?"}]
    },
    {
        "role": "model",
        "parts": [{"text": "For a project involving Generative AI, the key technical skills are typically Python, along with experience in deep learning frameworks like TensorFlow or PyTorch. It's also very important to have skills in prompt engineering and an understanding of API integration, as you'll likely be working with models like Gemini."}]
    }
]

# --- 3. DEFINE THE TOOLS (Functions the AI can call) ---
# A dedicated tool for conceptual search using the vector store (RAG)
def find_projects_by_concept(concept: str) -> str:
    """
    Use this tool for broad, conceptual, or semantic searches about projects.
    Excellent for questions like "find projects related to healthcare" or "what's a good project for a beginner?".
    """
    print(f"LLM Service: Using RAG to find projects related to '{concept}'")
    # This now calls the corrected function name in your vector_store
    return vector_store.find_similar_documents(concept)

tools = [
    find_projects_by_concept,
    db_query_service.find_projects,
    db_query_service.find_users,
    scraper.scrape_for_info,
]

# --- 4. INITIALIZE THE MODEL WITH THE SYSTEM PROMPT AND TOOLS ---
model = genai.GenerativeModel(
    model_name='gemini-2.5-flash',
    tools=tools,
    system_instruction=system_prompt
)

# --- 5. THE MAIN FUNCTION TO GENERATE AN ANSWER (Corrected Version) ---
def generate_answer(query):
    """
    Orchestrates the process of getting an intelligent answer. It first tries to
    use a specific tool for factual data. If no tool is chosen, it falls back
    to the RAG system for conceptual questions.
    """
    chat = model.start_chat(history=few_shot_examples)
    
    # --- Step 1: Try to use a tool first ---
    response = chat.send_message(query)
    
    try:
        function_call = response.candidates[0].content.parts[0].function_call
        tool_name = function_call.name
        tool_args = {key: value for key, value in function_call.args.items()}

        print(f"LLM decided to call tool: {tool_name} with arguments: {tool_args}")
        
        tool_to_call = next((t for t in tools if t.__name__ == tool_name), None)
        
        if tool_to_call:
            tool_response_str = tool_to_call(**tool_args)
            
            # Spell-check and suggestion logic
            try:
                tool_response_data = json.loads(tool_response_str)
                if isinstance(tool_response_data, list) and not tool_response_data:
                    suggestion_prompt = f"The user searched for '{query}', but the database returned no results. Is there a likely spelling mistake in the query? If so, suggest the correct spelling. If not, just say you couldn't find anything."
                    suggestion_response = model.generate_content(suggestion_prompt)
                    return suggestion_response.text
            except (json.JSONDecodeError, TypeError):
                pass # The response was not a JSON list, so proceed normally.

            # Send the tool's response back to the model for a final, natural language answer
            final_response = chat.send_message(
                [genai.protos.Part(
                    function_response={'name': tool_name, 'response': {'result': tool_response_str}}
                )]
            )
            return final_response.candidates[0].content.parts[0].text
        else:
             return "Sorry, I'm not sure how to handle that request."

    except (ValueError, IndexError, AttributeError):
        # --- Step 2: Fallback to RAG for conceptual questions ---
        print("LLM did not choose a tool, falling back to RAG for a conceptual answer.")
        
        conceptual_context = vector_store.find_similar_documents(query)
        
        final_prompt = f"""
        Answer the user's query based on the following context from the platform's knowledge base.

        Context:
        {conceptual_context}

        User Query:
        {query}
        """
        final_response = model.generate_content(final_prompt)
        return final_response.text