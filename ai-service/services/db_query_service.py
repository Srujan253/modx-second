# File: services/db_query_service.py
import psycopg2
import json
from core.config import DATABASE_URL

def _execute_query(query, params=None):
    """A helper function to connect to the DB, run a query, and return results."""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        cur.execute(query, params or ())
        colnames = [desc[0] for desc in cur.description]
        results = [dict(zip(colnames, row)) for row in cur.fetchall()]
        cur.close()
        conn.close()
        return results
    except Exception as e:
        print(f"Database error: {e}")
        return None

# --- Define the "Tools" that query your database ---

def find_projects(skill: str = None, title: str = None) -> str:
    """Finds projects in the MoDX database based on a skill or title."""
    print("find_projects called with:", skill, title)
    if not skill and not title:
        return json.dumps({"success": False, "message": "Please specify a skill or title to search for.", "data": []})

    base_query = "SELECT title, description, required_skills, tech_stack FROM projects"
    conditions = []
    params = []

    if title:
        conditions.append("title ILIKE %s")
        params.append(f"%{title}%")
    if skill:
        # Case-insensitive search for skill in required_skills array
        conditions.append("EXISTS (SELECT 1 FROM UNNEST(required_skills) s WHERE s ILIKE %s)")
        params.append(skill)

    if conditions:
        base_query += " WHERE " + " AND ".join(conditions)

    results = _execute_query(base_query, params)
    if results is None:
        return json.dumps({"success": False, "message": "Database error occurred.", "data": []})
    if not results:
        return json.dumps({"success": True, "message": "No projects found matching your criteria.", "data": []})
    return json.dumps({"success": True, "message": "Projects found.", "data": results})

def find_users(role: str = None, interest: str = None) -> str:
    """Finds users in the MoDX database based on their role or interest."""
    if not role and not interest:
        return json.dumps({"success": False, "message": "Please specify a role or interest to search for.", "data": []})

    base_query = "SELECT full_name, roles, interest FROM users"
    conditions = []
    params = []

    if role:
        conditions.append("%s = ANY(roles)")
        params.append(role)
    if interest:
        conditions.append("interest ILIKE %s")
        params.append(f"%{interest}%")

    if conditions:
        base_query += " WHERE " + " AND ".join(conditions)

    results = _execute_query(base_query, params)
    if results is None:
        return json.dumps({"success": False, "message": "Database error occurred.", "data": []})
    if not results:
        return json.dumps({"success": True, "message": "No users found matching your criteria.", "data": []})
    return json.dumps({"success": True, "message": "Users found.", "data": results})