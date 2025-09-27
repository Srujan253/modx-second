import psycopg2
from core.config import DATABASE_URL

def get_all_documents_with_metadata():
    """
    Fetches all project and user data and returns it as a list of tuples.
    Each tuple is (document_id, document_text, metadata_dict).
    """
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    documents = []
    
    # --- CORRECTED: Fetch Projects with Metadata and Leader's Name ---
    project_query = """
    SELECT 
        p.id, 
        p.title, 
        p.description, 
        p.required_skills, 
        p.tech_stack, 
        u.full_name AS leader_name 
    FROM 
        projects p
    JOIN 
        users u ON p.leader_id = u.id
    """
    cur.execute(project_query)
    for row in cur.fetchall():
        project_id, title, description, required_skills, tech_stack, leader_name = row
        doc_id = f"project_{project_id}"
        
        # The doc_text now correctly includes "Led by: [leader_name]"
        doc_text = f"Project: {title}. Led by: {leader_name}. Description: {description}. Skills: {', '.join(required_skills or [])}. Tech Stack: {tech_stack}."
        
        metadata = {"doc_type": "project"}
        documents.append((doc_id, doc_text, metadata))

    # --- Fetch Users with Metadata ---
    cur.execute("SELECT id, full_name, roles, interest FROM users")
    for row in cur.fetchall():
        user_id, full_name, roles, interest = row
        doc_id = f"user_{user_id}"
        doc_text = f"User: {full_name}. Roles: {', '.join(roles or [])}. Interests: {interest}."
        metadata = {"doc_type": "user"}
        documents.append((doc_id, doc_text, metadata))
        
    cur.close()
    conn.close()
    
    return documents

