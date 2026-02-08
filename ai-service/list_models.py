import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv(r'e:\project\MODXX1\Modx\ai-service\.env')

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

output_file = r'e:\project\MODXX1\Modx\ai-service\available_models.txt'

try:
    with open(output_file, 'w') as f:
        f.write(f"Using API Key: {GEMINI_API_KEY[:5]}...{GEMINI_API_KEY[-5:]}\n\n")
        f.write("Available models:\n")
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                f.write(f"Model: {m.name}\n")
    print(f"Successfully saved models to {output_file}")
except Exception as e:
    print(f"Error: {e}")
