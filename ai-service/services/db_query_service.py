# File: services/db_query_service.py
import json
from database import get_mongodb_connection

def _execute_query_mongodb(collection_name, query_filter, projection=None):
    """Helper function to query MongoDB and return results"""
    try:
        db = get_mongodb_connection()
        collection = db[collection_name]
        results = list(collection.find(query_filter, projection))
        
        # Convert ObjectId to string for JSON serialization
        for result in results:
            if '_id' in result:
                result['_id'] = str(result['_id'])
        
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

    query_filter = {}
    
    if title:
        # Case-insensitive regex search for title
        query_filter['title'] = {'$regex': title, '$options': 'i'}
    
    if skill:
        # Case-insensitive search in requiredSkills array
        query_filter['requiredSkills'] = {'$regex': skill, '$options': 'i'}
    
    # If both are specified, use AND logic
    if title and skill:
        query_filter = {'$and': [
            {'title': {'$regex': title, '$options': 'i'}},
            {'requiredSkills': {'$regex': skill, '$options': 'i'}}
        ]}
    
    projection = {'title': 1, 'description': 1, 'requiredSkills': 1, 'techStack': 1, '_id': 0}
    results = _execute_query_mongodb('projects', query_filter, projection)
    
    if results is None:
        return json.dumps({"success": False, "message": "Database error occurred.", "data": []})
    if not results:
        return json.dumps({"success": True, "message": "No projects found matching your criteria.", "data": []})
    return json.dumps({"success": True, "message": "Projects found.", "data": results})

def find_users(role: str = None, interest: str = None) -> str:
    """Finds users in the MoDX database based on their role or interest."""
    if not role and not interest:
        return json.dumps({"success": False, "message": "Please specify a role or interest to search for.", "data": []})

    query_filter = {}
    
    if role:
        # Search in roles array
        query_filter['roles'] = role
    
    if interest:
        # Case-insensitive regex search for interest
        query_filter['interest'] = {'$regex': interest, '$options': 'i'}
    
    # If both are specified, use AND logic
    if role and interest:
        query_filter = {'$and': [
            {'roles': role},
            {'interest': {'$regex': interest, '$options': 'i'}}
        ]}
    
    projection = {'fullName': 1, 'roles': 1, 'interest': 1, '_id': 0}
    results = _execute_query_mongodb('users', query_filter, projection)
    
    if results is None:
        return json.dumps({"success": False, "message": "Database error occurred.", "data": []})
    if not results:
        return json.dumps({"success": True, "message": "No users found matching your criteria.", "data": []})
    return json.dumps({"success": True, "message": "Users found.", "data": results})