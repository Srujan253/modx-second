"""
Re-index all existing projects and users into ChromaDB.
This script will:
1. Connect to your MongoDB database
2. Fetch ALL projects and users (ignoring indexedAt field)
3. Add them to your new ChromaDB instance
4. Mark them as indexed in MongoDB

Run this script once after setting up your new ChromaDB credentials.
"""

from pymongo import MongoClient
from bson import ObjectId
from core.config import MONGODB_URI
from services.vector_store import add_documents_to_store
from datetime import datetime

def get_mongodb_connection():
    """Get MongoDB connection"""
    client = MongoClient(MONGODB_URI)
    db = client.get_database()
    return db

def reindex_all_projects():
    """Re-index ALL projects from MongoDB into ChromaDB"""
    db = get_mongodb_connection()
    documents = []

    projects_collection = db['projects']
    users_collection = db['users']
    
    print("🔍 Fetching all projects from MongoDB...")
    
    # Fetch ALL projects (no filter)
    projects = projects_collection.find({})
    project_count = 0
    
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
        project_count += 1

    print(f"✅ Found {project_count} projects")
    
    # Fetch ALL users (no filter)
    print("🔍 Fetching all users from MongoDB...")
    users = users_collection.find({})
    user_count = 0
    
    for user in users:
        user_id = str(user['_id'])
        doc_id = f"user_{user_id}"
        
        full_name = user.get('fullName', '')
        roles = user.get('roles', [])
        interest = user.get('interest', '')
        
        roles_str = ', '.join(roles) if roles else ''
        
        doc_text = f"User: {full_name}. Roles: {roles_str}. Interests: {interest}."
        metadata = {"doc_type": "user"}
        documents.append((doc_id, doc_text, metadata))
        user_count += 1

    print(f"✅ Found {user_count} users")
    
    if not documents:
        print("⚠️ No documents found to index!")
        return

    # Add all documents to ChromaDB
    print(f"\n📤 Indexing {len(documents)} documents into ChromaDB...")
    add_documents_to_store(documents)
    
    # Mark all as indexed in MongoDB
    print("📝 Marking documents as indexed in MongoDB...")
    
    project_ids = [d[0].split("_")[1] for d in documents if d[0].startswith("project_")]
    user_ids = [d[0].split("_")[1] for d in documents if d[0].startswith("user_")]
    
    if project_ids:
        object_ids = [ObjectId(id_str) for id_str in project_ids]
        projects_collection.update_many(
            {'_id': {'$in': object_ids}},
            {'$set': {'indexedAt': datetime.utcnow()}}
        )
        print(f"✅ Marked {len(project_ids)} projects as indexed")
    
    if user_ids:
        object_ids = [ObjectId(id_str) for id_str in user_ids]
        users_collection.update_many(
            {'_id': {'$in': object_ids}},
            {'$set': {'indexedAt': datetime.utcnow()}}
        )
        print(f"✅ Marked {len(user_ids)} users as indexed")
    
    print(f"\n🎉 Successfully re-indexed {project_count} projects and {user_count} users!")
    print("Your ChromaDB is now ready to use!")

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 Re-indexing All Projects and Users into ChromaDB")
    print("=" * 60)
    print()
    
    try:
        reindex_all_projects()
    except Exception as e:
        print(f"\n❌ Error during re-indexing: {e}")
        import traceback
        traceback.print_exc()
