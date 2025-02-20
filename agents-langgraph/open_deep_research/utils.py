import os
import asyncio
import requests
import aiohttp

from tavily import TavilyClient, AsyncTavilyClient
from open_deep_research.state import Section
from langsmith import traceable

tavily_client = TavilyClient()
tavily_async_client = AsyncTavilyClient()

def deduplicate_and_format_sources(search_response, max_tokens_per_source, include_raw_content=True):
    """
    Takes a list of search responses and formats them into a readable string.
    Limits the raw_content to approximately max_tokens_per_source.
 
    Args:
        search_responses: List of search response dicts, each containing:
            - query: str
            - results: List of dicts with fields:
                - title: str
                - url: str
                - content: str
                - score: float
                - raw_content: str|None
        max_tokens_per_source: int
        include_raw_content: bool
            
    Returns:
        str: Formatted string with deduplicated sources
    """
     # Collect all results
    sources_list = []
    for response in search_response:
        sources_list.extend(response['results'])
    
    # Deduplicate by URL
    unique_sources = {source['url']: source for source in sources_list}

    # Format output
    formatted_text = "Sources:\n\n"
    for i, source in enumerate(unique_sources.values(), 1):
        formatted_text += f"Source {source['title']}:\n===\n"
        formatted_text += f"URL: {source['url']}\n===\n"
        formatted_text += f"Most relevant content from source: {source['content']}\n===\n"
        if include_raw_content:
            # Using rough estimate of 4 characters per token
            char_limit = max_tokens_per_source * 4
            # Handle None raw_content
            raw_content = source.get('raw_content', '')
            if raw_content is None:
                raw_content = ''
                print(f"Warning: No raw_content found for source {source['url']}")
            if len(raw_content) > char_limit:
                raw_content = raw_content[:char_limit] + "... [truncated]"
            formatted_text += f"Full source content limited to {max_tokens_per_source} tokens: {raw_content}\n\n"
                
    return formatted_text.strip()

def format_sections(sections: list[Section]) -> str:
    """ Format a list of sections into a string """
    formatted_str = ""
    for idx, section in enumerate(sections, 1):
        formatted_str += f"""
{'='*60}
Section {idx}: {section.name}
{'='*60}
Description:
{section.description}
Requires Research: 
{section.research}

Content:
{section.content if section.content else '[Not yet written]'}

"""
    return formatted_str

@traceable
async def tavily_search_async(search_queries):
    """
    Performs concurrent web searches using the Tavily API.

    Args:
        search_queries (List[SearchQuery]): List of search queries to process

    Returns:
            List[dict]: List of search responses from Tavily API, one per query. Each response has format:
                {
                    'query': str, # The original search query
                    'follow_up_questions': None,      
                    'answer': None,
                    'images': list,
                    'results': [                     # List of search results
                        {
                            'title': str,            # Title of the webpage
                            'url': str,              # URL of the result
                            'content': str,          # Summary/snippet of content
                            'score': float,          # Relevance score
                            'raw_content': str|None  # Full page content if available
                        },
                        ...
                    ]
                }
    """
    
    search_tasks = []
    for query in search_queries:
            search_tasks.append(
                tavily_async_client.search(
                    query,
                    max_results=5,
                    include_raw_content=True,
                    topic="general"
                )
            )

    # Execute all searches concurrently
    search_docs = await asyncio.gather(*search_tasks)

    return search_docs

@traceable
async def bing_search_async(search_queries):
    """
    Performs concurrent web searches using the Bing API.

    Args:
        search_queries (List[SearchQuery]): List of search queries to process

    Returns:
        List[dict]: List of search responses formatted to match Tavily API format
    """
    subscription_key = os.getenv('BING_API_KEY')
    endpoint = "https://api.bing.microsoft.com/v7.0/search"
    headers = {"Ocp-Apim-Subscription-Key": subscription_key}

    async def search_bing(query):
        async with aiohttp.ClientSession() as session:
            async with session.get(endpoint, headers=headers, params={"q": query, "count": 5}) as response:
                search_results = await response.json()
                
                # Format results to match Tavily structure
                results = []
                for item in search_results.get("webPages", {}).get("value", []):
                    results.append({
                        "title": item["name"],
                        "url": item["url"],
                        "content": item["snippet"],
                        "score": 1.0,
                        "raw_content": item["snippet"]  # Bing doesn't provide full content
                    })
                
                return {
                    "query": query,
                    "follow_up_questions": None,
                    "answer": None,
                    "images": [],
                    "results": results
                }

    # Execute all searches concurrently
    search_tasks = [search_bing(query.search_query) for query in search_queries]
    search_docs = await asyncio.gather(*search_tasks)

    return search_docs