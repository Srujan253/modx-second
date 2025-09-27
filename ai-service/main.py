import grpc
import time
from concurrent import futures
from services import vector_store
from services import vector_indexer
from services.vector_store import delete_document_from_store
# Import the auto-generated gRPC files
import ai_pb2
import ai_pb2_grpc

# Import your existing AI logic
from core import orchestrator

# This class implements the service defined in the .proto file.
class AIServiceServicer(ai_pb2_grpc.AIServiceServicer):
    # This method handles the GetChatbotResponse RPC call.
    def GetChatbotResponse(self, request, context):
        print(f"gRPC Server: Received query: '{request.query}'")
        answer_text = orchestrator.process_query(request.query)
        return ai_pb2.ChatReply(answer=answer_text)
    
    def GetUserRecommendations(self, request, context):
        # Fetch up to 10 personalized recommendations for the Explore page
        doc_ids = vector_store.find_similar_document_ids(request.query_text, n_results=10)
        return ai_pb2.RecommendationReply(recommended_ids=doc_ids)

    def GetRelatedProjects(self, request, context):
        # Fetch the top 6 related projects for the detail page
        doc_ids = vector_store.find_similar_document_ids(request.query_text, n_results=6)
        return ai_pb2.RecommendationReply(recommended_ids=doc_ids)

    def SearchProjects(self, request, context):
        # Fetch the top 6 most relevant search results
        doc_ids = vector_store.find_similar_document_ids(request.search_query, n_results=6)
        return ai_pb2.RecommendationReply(recommended_ids=doc_ids)

    def IndexNewData(self, request, context):
        # Call the indexing logic
        result = vector_indexer.index_new_data()
        return ai_pb2.IndexReply(status=result)
    
    def DeleteProjectFromIndex(self, request, context):
        project_id = request.project_id
        doc_id = f"project_{project_id}"
        delete_document_from_store(doc_id)
        return ai_pb2.IndexingResponse(message=f"Deleted {doc_id} from index")

def serve():
    # Create a gRPC server with a thread pool for handling requests
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    
    # Add our service implementation to the server
    ai_pb2_grpc.add_AIServiceServicer_to_server(AIServiceServicer(), server)
    
    # Start the server on port 50051
    print('Starting gRPC server on port 50051...')
    server.add_insecure_port('[::]:50051')
    server.start()
    
    try:
        while True:
            time.sleep(86400) # Sleep for one day
    except KeyboardInterrupt:
        server.stop(0)

if __name__ == '__main__':
    serve()

