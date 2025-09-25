# File: services/scraper.py
import requests
from bs4 import BeautifulSoup
import google.generativeai as genai
from core.config import GEMINI_API_KEY
import concurrent.futures

# Configure the Gemini client for summarization
genai.configure(api_key=GEMINI_API_KEY)
summarization_model = genai.GenerativeModel('gemini-1.5-flash')

# --- Helper Functions ---

def _get_top_search_links(query: str, num_links: int = 5) -> list[str]:
    """Performs a search and returns the top URLs."""
    try:
        search_url = f"https://html.duckduckgo.com/html/?q={query}"
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        response = requests.get(search_url, headers=headers, timeout=5)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find the result links, which have the class 'result__a'
        links = [a['href'] for a in soup.find_all('a', class_='result__a')[:num_links]]
        return links
    except requests.RequestException as e:
        print(f"Error fetching search results: {e}")
        return []

def _scrape_and_clean_page(url: str) -> str:
    """Visits a single URL and extracts the main text content."""
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        response = requests.get(url, headers=headers, timeout=7)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')
        
        # A common strategy is to find the main content area and extract all paragraph text
        main_content = soup.find('main') or soup.find('article') or soup.body
        paragraphs = main_content.find_all('p')
        
        # Join all paragraph texts into a single string, limiting the total length
        full_text = " ".join([p.get_text(strip=True) for p in paragraphs])
        return full_text[:4000] # Limit to ~4000 characters to keep it manageable
    except requests.RequestException as e:
        print(f"Error scraping URL {url}: {e}")
        return ""

def _summarize_text_with_ai(text: str) -> str:
    """Uses the Gemini API to summarize the text from a scraped page."""
    if not text:
        return ""
    try:
        prompt = f"Please summarize the following text into a few key bullet points:\n\n---\n{text}\n---"
        response = summarization_model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Error during AI summarization: {e}")
        return "Could not summarize content."


# --- Main Scraper Function ---

def scrape_for_info(query: str) -> str:
    """
    The main function that orchestrates the scraping and summarization process.
    It finds the top 5 links, scrapes each one in parallel, summarizes the content,
    and returns a consolidated report.
    """
    print(f"Starting advanced web scrape for query: '{query}'")
    
    # 1. Discover the top URLs
    urls = _get_top_search_links(query)
    if not urls:
        return "I couldn't find any relevant websites for that topic."

    # 2. Scrape and summarize each URL in parallel for speed
    summaries = []
    with concurrent.futures.ThreadPoolExecutor() as executor:
        # Scrape the raw text from each page
        future_to_url = {executor.submit(_scrape_and_clean_page, url): url for url in urls}
        raw_texts = [future.result() for future in concurrent.futures.as_completed(future_to_url)]
        
        # Summarize the raw text from each page
        future_to_summary = {executor.submit(_summarize_text_with_ai, text): text for text in raw_texts}
        summaries = [future.result() for future in concurrent.futures.as_completed(future_to_summary)]

    # 3. Consolidate the results into a final report
    final_context = "I found the following information from the web:\n\n"
    for i, summary in enumerate(summaries):
        if summary: # Only add if summarization was successful
            final_context += f"Source {i+1}:\n{summary}\n\n"
            
    if final_context == "I found the following information from the web:\n\n":
        return "I was able to find some websites but could not extract a clear summary."

    return final_context