"""
Model Manager for Gemini API with automatic fallback support.

This module provides a resilient model management system that automatically
switches between different Gemini models when one fails due to quota limits
or availability issues.
"""

import google.generativeai as genai
from core.config import GEMINI_API_KEY
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Gemini API
genai.configure(api_key=GEMINI_API_KEY)

# Model priority list (ordered by preference and quota availability)
MODEL_FALLBACK_ORDER = [
    'gemini-2.5-flash',           # Primary: 0/5 requests used
    'gemini-3-flash',              # Fallback 1: 0/5 requests used
    'gemini-2.5-flash-lite',       # Fallback 2: 0/10 requests used
    'gemini-flash-latest',         # Fallback 3: Latest stable alias
    'gemini-2.0-flash-lite',       # Fallback 4: 0/10 requests used
    'gemini-2.0-flash',            # Fallback 5: May have quota issues
]


class ModelManager:
    """Manages Gemini model instances with automatic fallback."""
    
    def __init__(self, tools=None, system_instruction=None):
        """
        Initialize the ModelManager.
        
        Args:
            tools: Optional list of tools for function calling
            system_instruction: Optional system instruction for the model
        """
        self.tools = tools
        self.system_instruction = system_instruction
        self.current_model_name = None
        self.current_model = None
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize the first available model from the fallback list."""
        for model_name in MODEL_FALLBACK_ORDER:
            try:
                logger.info(f"Attempting to initialize model: {model_name}")
                model = self._create_model(model_name)
                
                # Don't test the model during initialization to save quota
                # The fallback will happen automatically on first real use if needed
                self.current_model_name = model_name
                self.current_model = model
                logger.info(f"✅ Successfully initialized model: {model_name}")
                return
            except Exception as e:
                logger.warning(f"❌ Failed to initialize {model_name}: {str(e)[:100]}")
                continue
        
        # If all models fail, raise an error
        raise RuntimeError("All Gemini models failed to initialize. Please check your API key and quota.")
    
    def _create_model(self, model_name):
        """Create a GenerativeModel instance."""
        if self.tools and self.system_instruction:
            return genai.GenerativeModel(
                model_name=model_name,
                tools=self.tools,
                system_instruction=self.system_instruction
            )
        elif self.system_instruction:
            return genai.GenerativeModel(
                model_name=model_name,
                system_instruction=self.system_instruction
            )
        else:
            return genai.GenerativeModel(model_name=model_name)
    
    def get_model(self):
        """
        Get the current working model.
        
        Returns:
            GenerativeModel: The current model instance
        """
        return self.current_model
    
    def generate_content(self, *args, **kwargs):
        """
        Generate content with automatic fallback on failure.
        
        This method tries the current model first, and if it fails due to
        quota or availability issues, it automatically tries the next model
        in the fallback list.
        """
        last_exception = None
        
        # Try current model first
        try:
            return self.current_model.generate_content(*args, **kwargs)
        except Exception as e:
            logger.warning(f"Model {self.current_model_name} failed: {str(e)[:100]}")
            last_exception = e
        
        # Try remaining models in fallback order
        current_index = MODEL_FALLBACK_ORDER.index(self.current_model_name)
        for model_name in MODEL_FALLBACK_ORDER[current_index + 1:]:
            try:
                logger.info(f"Switching to fallback model: {model_name}")
                self.current_model = self._create_model(model_name)
                self.current_model_name = model_name
                
                result = self.current_model.generate_content(*args, **kwargs)
                logger.info(f"✅ Successfully switched to model: {model_name}")
                return result
            except Exception as e:
                logger.warning(f"Fallback model {model_name} failed: {str(e)[:100]}")
                last_exception = e
                continue
        
        # If all models fail, raise the last exception
        raise last_exception
    
    def start_chat(self, **kwargs):
        """
        Start a chat session with automatic fallback support.
        
        Returns:
            ChatSession: A chat session wrapper with fallback support
        """
        return ChatSessionWrapper(self, **kwargs)


class ChatSessionWrapper:
    """Wrapper for chat sessions that provides fallback support."""
    
    def __init__(self, model_manager, **kwargs):
        """
        Initialize the chat session wrapper.
        
        Args:
            model_manager: The ModelManager instance
            **kwargs: Arguments to pass to start_chat()
        """
        self.model_manager = model_manager
        self.chat_kwargs = kwargs
        self.chat = self.model_manager.get_model().start_chat(**kwargs)
    
    def send_message(self, *args, **kwargs):
        """
        Send a message with automatic fallback on failure.
        """
        last_exception = None
        
        # Try current chat session first
        try:
            return self.chat.send_message(*args, **kwargs)
        except Exception as e:
            logger.warning(f"Chat session failed: {str(e)[:100]}")
            last_exception = e
        
        # Try to recreate chat with fallback models
        current_index = MODEL_FALLBACK_ORDER.index(self.model_manager.current_model_name)
        for model_name in MODEL_FALLBACK_ORDER[current_index + 1:]:
            try:
                logger.info(f"Recreating chat session with fallback model: {model_name}")
                self.model_manager.current_model = self.model_manager._create_model(model_name)
                self.model_manager.current_model_name = model_name
                
                # Recreate chat session with new model
                self.chat = self.model_manager.get_model().start_chat(**self.chat_kwargs)
                result = self.chat.send_message(*args, **kwargs)
                logger.info(f"✅ Successfully switched chat to model: {model_name}")
                return result
            except Exception as e:
                logger.warning(f"Fallback chat with {model_name} failed: {str(e)[:100]}")
                last_exception = e
                continue
        
        # If all models fail, raise the last exception
        raise last_exception
