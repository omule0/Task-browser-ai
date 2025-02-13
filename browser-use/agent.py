from langchain_openai import ChatOpenAI
from browser_use import Agent
from browser_use import BrowserConfig, Browser
import asyncio
from dotenv import load_dotenv
import os
load_dotenv()

ANCHOR_API_KEY=os.getenv("ANCHOR_API_KEY")

# Local browser service
#note: Chrome must be installed on the machine and all chrome instances must be closed before running the script
loacl_browser = Browser(
    config=BrowserConfig(
        # Specify the path to your Chrome executable
        chrome_instance_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',  # macOS path
        # For Windows, typically: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        # For Linux, typically: '/usr/bin/google-chrome'
    )
)

# Hosted browser service
hosted_browser = Browser(
     config = BrowserConfig(
        cdp_url=f"wss://connect.anchorbrowser.io?apiKey={ANCHOR_API_KEY}"
    )
)

async def main():
    
   
    agent = Agent(
        task="go to https://disruptafrica.com/ and click on news and return a list of all the news articles",
        llm=ChatOpenAI(model="gpt-4o-mini"),
        # browser=loacl_browser,
    )
    result = await agent.run()
    print(result)

asyncio.run(main())