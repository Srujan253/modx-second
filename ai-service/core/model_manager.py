"""
Model Manager for Gemini API with automatic fallback support.

This module provides a resilient model management system that automatically
switches between different Gemini models when one fails due to quota limits
or availability issues.
"""

from google import genai
from google.genai import types
from core.config import GEMINI_API_KEY
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Gemini client
_client = genai.Client(api_key=GEMINI_API_KEY)

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
        """Build a config dict for use with the new client API."""
        # In google.genai the model name + config are passed at call time,
        # so we just store the name; _client is used in generate_content.
        return model_name  # model name string used with _client
    
    def get_model(self):
        """
        Get the current working model.
        
        Returns:
            GenerativeModel: The current model instance
        """
        return self.current_model
    
    def generate_content(self, prompt, **kwargs):
        """
        Generate content with automatic fallback on failure.
        """
        last_exception = None
        config_kwargs = {}
        if self.system_instruction:
            config_kwargs['system_instruction'] = self.system_instruction
        if self.tools:
            config_kwargs['tools'] = self.tools

        # Try current model first
        try:
            return _client.models.generate_content(
                model=self.current_model_name,
                contents=prompt,
                config=types.GenerateContentConfig(**config_kwargs) if config_kwargs else None
            )
        except Exception as e:
            logger.warning(f"Model {self.current_model_name} failed: {str(e)[:100]}")
            last_exception = e

        # Try remaining models in fallback order
        current_index = MODEL_FALLBACK_ORDER.index(self.current_model_name)
        for model_name in MODEL_FALLBACK_ORDER[current_index + 1:]:
            try:
                logger.info(f"Switching to fallback model: {model_name}")
                self.current_model_name = model_name
                self.current_model = model_name
                result = _client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(**config_kwargs) if config_kwargs else None
                )
                logger.info(f"✅ Successfully switched to model: {model_name}")
                return result
            except Exception as e:
                logger.warning(f"Fallback model {model_name} failed: {str(e)[:100]}")
                last_exception = e
                continue

        raise last_exception
    
    def start_chat(self, **kwargs):
        """
        Start a chat session with automatic fallback support.

        Returns:
            ChatSessionWrapper: A chat session wrapper with fallback support
        """
        return ChatSessionWrapper(self, **kwargs)


class ChatSessionWrapper:
    """Wrapper for chat sessions that provides fallback support."""
    
    def __init__(self, model_manager, history=None, **kwargs):
        """
        Initialize the chat session wrapper using the new google.genai client.
        """
        self.model_manager = model_manager
        self.history = history or []
        self.chat_kwargs = kwargs
        self._create_chat_session()

    def _create_chat_session(self):
        """Create a new chat session with the current model."""
        config_kwargs = {}
        if self.model_manager.system_instruction:
            config_kwargs['system_instruction'] = self.model_manager.system_instruction
        if self.model_manager.tools:
            config_kwargs['tools'] = self.model_manager.tools
        self.chat = _client.chats.create(
            model=self.model_manager.current_model_name,
            history=self.history,
            config=types.GenerateContentConfig(**config_kwargs) if config_kwargs else None
        )

    def send_message(self, message, **kwargs):
        """
        Send a message with automatic fallback on failure.
        """
        last_exception = None

        try:
            return self.chat.send_message(message)
        except Exception as e:
            logger.warning(f"Chat session failed: {str(e)[:100]}")
            last_exception = e

        # Try to recreate chat with fallback models
        current_index = MODEL_FALLBACK_ORDER.index(self.model_manager.current_model_name)
        for model_name in MODEL_FALLBACK_ORDER[current_index + 1:]:
            try:
                logger.info(f"Recreating chat session with fallback model: {model_name}")
                self.model_manager.current_model_name = model_name
                self.model_manager.current_model = model_name
                self._create_chat_session()
                result = self.chat.send_message(message)
                logger.info(f"✅ Successfully switched chat to model: {model_name}")
                return result
            except Exception as e:
                logger.warning(f"Fallback chat with {model_name} failed: {str(e)[:100]}")
                last_exception = e
                continue

        raise last_exception
