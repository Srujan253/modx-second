from pymongo import MongoClient
from bson import ObjectId
from core.config import MONGODB_URI

def get_mongodb_connection():
    """Get MongoDB connection"""
    client = MongoClient(MONGODB_URI)
    db = client.get_database()  # Uses database from connection string
    return db

def get_new_or_updated_documents():
    """Fetch new or updated documents from MongoDB for indexing"""
    db = get_mongodb_connection()
    documents = []

    # Projects - fetch projects that need indexing
    projects_collection = db['projects']
    users_collection = db['users']
    
    # Find projects where indexed_at is null or updated_at > indexed_at
    projects_query = {
        '$or': [
            {'indexedAt': {'$exists': False}},
            {'indexedAt': None},
            {'$expr': {'$gt': ['$updatedAt', '$indexedAt']}}
        ]
    }
    
    projects = projects_collection.find(projects_query)
    
    for project in projects:
        # Get leader info
        leader = users_collection.find_one({'_id': project.get('leaderId')})
        leader_name = leader.get('fullName', 'Unknown') if leader else 'Unknown'
        
        project_id = str(project['_id'])
        doc_id = f"project_{project_id}"
        
        # Build document text
        title = project.get('title', '')
        description = project.get('description', '')
        required_skills = project.get('requiredSkills', [])
        tech_stack = project.get('techStack', [])
        
        skills_str = ', '.join(required_skills) if required_skills else ''
        tech_str = ', '.join(tech_stack) if tech_stack else ''
        
        doc_text = f"Project: {title}. Led by: {leader_name}. Description: {description}. Skills: {skills_str}. Tech Stack: {tech_str}."
        metadata = {"doc_type": "project"}
        documents.append((doc_id, doc_text, metadata))

    # Users - fetch users that need indexing
    users_query = {
        '$or': [
            {'indexedAt': {'$exists': False}},
            {'indexedAt': None},
            {'$expr': {'$gt': ['$updatedAt', '$indexedAt']}}
        ]
    }
    
    users = users_collection.find(users_query)
    
    for user in users:
        user_id = str(user['_id'])
        doc_id = f"user_{user_id}"
        
        full_name = user.get('fullName', '')
        roles = user.get('roles', [])
        interest = user.get('interest', '')
        skills = user.get('skills', [])
        bio = user.get('bio', '')
        
        roles_str = ', '.join(roles) if roles else ''
        skills_str = ', '.join(skills) if skills else ''
        
        doc_text = f"User: {full_name}. Roles: {roles_str}. Interests: {interest}. Skills: {skills_str}. Bio: {bio}."
        metadata = {"doc_type": "user"}
        documents.append((doc_id, doc_text, metadata))

    return documents

def mark_as_indexed(ids, collection_name):
    """Mark documents as indexed in MongoDB"""
    from datetime import datetime
    
    db = get_mongodb_connection()
    collection = db[collection_name]
    
    # Convert string IDs to ObjectIds
    object_ids = [ObjectId(id_str) for id_str in ids]
    
    # Update indexed_at timestamp
    collection.update_many(
        {'_id': {'$in': object_ids}},
        {'$set': {'indexedAt': datetime.utcnow()}}
    )