# File: database.py
import psycopg2
from core.config import DATABASE_URL

def get_all_documents():
    """Fetches and formats all project and user data, including project leader info."""
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    documents = []
    
    # Query to get all projects and the full name of their leaders
    project_query = """
    SELECT 
        p.title, 
        p.description, 
        p.required_skills, 
        p.tech_stack, 
        p.created_at, 
        u.full_name AS leader_name 
    FROM 
        projects p
    JOIN 
        users u ON p.leader_id = u.id
    """
    
    cur.execute(project_query)
    for row in cur.fetchall():
        title, description, required_skills, tech_stack, created_at, leader_name = row
        skills = required_skills if isinstance(required_skills, list) else []
        created_date = created_at.strftime("%Y-%m-%d")
        
        documents.append(
            f"Project: {title}. Led by: {leader_name}. Description: {description}. "
            f"Required Skills: {', '.join(skills)}. Tech Stack: {tech_stack}. "
            f"Created On: {created_date}."
        )

    # Query to get all users
    cur.execute("SELECT full_name, roles, interest, created_at FROM users")
    for row in cur.fetchall():
        full_name, roles, interest, created_at = row
        user_roles = roles if isinstance(roles, list) else []
        join_date = created_at.strftime("%Y-%m-%d")

        documents.append(
            f"User: {full_name}. Roles: {', '.join(user_roles)}. "
            f"Interests: {interest}. Joined On: {join_date}."
        )
        
    cur.close()
    conn.close()
    
    return documents