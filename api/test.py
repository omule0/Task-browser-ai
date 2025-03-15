import asyncio
import os
import time
from datetime import datetime

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from pydantic import SecretStr
from browser_use import Agent, Browser, BrowserConfig

load_dotenv()

browser = Browser(
    config=BrowserConfig(
        # Specify the path to your Chrome executable
        chrome_instance_path='/Applications/Chromium.app/Contents/MacOS/Chromium',  # macOS path
        # For Windows, typically: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        # For Linux, typically: '/usr/bin/google-chrome'
    )
)


planner_llm = ChatOpenAI(
    base_url='https://api.deepseek.com/v1',
    model="deepseek-chat",
    api_key=SecretStr(os.getenv("DEEPSEEK_API_KEY")),
)

# Initialize the model
llm = ChatOpenAI(
    model='gpt-4o-mini',
    temperature=0.0,
)

# Also initialize a report generation model
report_llm = ChatOpenAI(
    model='gpt-4o-mini',
    temperature=0.1,  # Reduced temperature for more factual responses
)

task = f"go to digest africa that's it."


async def generate_report(agent_result):
    """
    Generate a comprehensive document based strictly on the agent's findings.
    The document type and structure will be dynamically determined based on the task,
    but all content will be factual and based only on the actual browsing results.

    Args:
        agent_result: The result object returned by the agent

    Returns:
        str: A formatted document as text
    """
    # Extract data from results
    final_result = agent_result.final_result()
    is_done = agent_result.is_done()
    has_errors = agent_result.has_errors()

    # Process the agent's thoughts into a structured format
    thoughts_list = agent_result.model_thoughts()
    thoughts_text = "\n".join(
        [f"- {thought}" for thought in thoughts_list[:5]]) if thoughts_list else "No recorded thoughts."

    # Process action results into useful content
    actions = agent_result.action_results()

    # Extract key data points from actions
    action_contents = []
    visited_urls = []
    key_elements = []
    errors_encountered = []
    all_content = []

    for action in actions:
        if hasattr(action, 'extracted_content') and action.extracted_content:
            action_contents.append(action.extracted_content)
            all_content.append(action.extracted_content)

        # Extract URLs if available
        if hasattr(action, 'url') and action.url:
            visited_urls.append(action.url)

        # Extract key elements found
        if hasattr(action, 'elements_found') and action.elements_found:
            key_elements.extend(action.elements_found)
            all_content.append(str(action.elements_found))

        # Track any errors
        if hasattr(action, 'error') and action.error:
            errors_encountered.append(action.error)

    # Concatenate all available content for factual analysis
    all_available_content = "\n".join(all_content)

    # Determine task domain (financial, technical, market research, etc.)
    domain_prompt = f"""
    Based ONLY on the following task and actual browser results, determine the primary domain category this task falls under.
    Do NOT fabricate or assume information not explicitly found in the results.
    
    TASK: {task}
    
    ACTUAL RESULTS: {final_result}
    
    Select the single most appropriate domain from these options:
    1. Financial Analysis
    2. Market Research
    3. Technical Exploration
    4. Competitive Intelligence
    5. User Experience
    6. Data Analysis
    7. Industry Overview
    8. Product Evaluation
    9. Educational Content
    10. Strategic Planning
    
    If there is insufficient information to determine the domain, respond with "Insufficient Data".
    Otherwise, respond ONLY with the domain name.
    """

    domain_response = await report_llm.ainvoke(domain_prompt)
    task_domain = domain_response.content.strip()

    if task_domain == "Insufficient Data":
        task_domain = "General Information"

    # Step 1: Determine the optimal document type based strictly on actual results
    doc_type_prompt = f"""
    Based ONLY on the following task and ACTUAL browser results, determine the most appropriate document type.
    Do NOT fabricate any information not directly found in the results.
    
    TASK: {task}
    
    DOMAIN: {task_domain}
    
    ACTUAL FINDINGS: {final_result}
    
    VISITED URLS: {', '.join(visited_urls) if visited_urls else "None recorded"}
    
    Select the optimal document type from these options:
    1. Summary - Concise overview highlighting main points (used for abstracts or executive summaries)
    2. Article - Written composition on a specific topic (scholarly, popular, or trade-focused)
    3. Report - Detailed account presenting information based on research or analysis
    4. Essay - Short piece reflecting a perspective on a particular topic
    5. Review - Critical evaluation of a work, offering summary and assessment
    6. Manual - Instructional guide providing detailed information on operation or procedures
    7. Technical Analysis - In-depth examination of technical aspects with data-focused sections
    8. Market Intelligence - Analysis of competitive or industry information with trends and comparisons
    9. Tactical Guide - Action-oriented document with step-by-step instructions
    10. Assessment - Evaluation-based document with ratings or scores
    11. Data Paper - Presentation of datasets with methodologies and analyses
    12. Bibliography - Organized list of resources related to a particular subject
    13. Proceedings Summary - Summary of conference/meeting contributions and key takeaways
    14. Website Evaluation - Analysis of web properties, features, and performance
    15. Trend Analysis - Identification of patterns, movements, and directional indicators
    
    If there is insufficient information for any of these types, select "Summary".
    Respond ONLY with the document type name.
    """

    # Get document type recommendation
    doc_type_response = await report_llm.ainvoke(doc_type_prompt)
    document_type = doc_type_response.content.strip()

    # Define format-specific settings based on document type
    format_settings = {}

    # Default format settings
    format_settings["heading_style"] = "# "
    format_settings["subheading_style"] = "## "
    format_settings["emphasis"] = "**"
    format_settings["needs_citations"] = True
    format_settings["needs_metrics"] = True
    format_settings["needs_executive_summary"] = True
    format_settings["needs_visuals"] = True
    format_settings["needs_conclusion"] = True
    format_settings["tone"] = "professional"

    # Adjust format settings based on document type
    if document_type.lower().startswith("summary"):
        format_settings["needs_executive_summary"] = False
        format_settings["needs_citations"] = False
        format_settings["max_sections"] = 3
        format_settings["tone"] = "concise"

    elif document_type.lower().startswith("article"):
        format_settings["tone"] = "engaging"
        format_settings["needs_visuals"] = True

    elif document_type.lower().startswith("essay"):
        format_settings["tone"] = "reflective"
        format_settings["needs_metrics"] = False

    elif document_type.lower().startswith("review"):
        format_settings["tone"] = "critical"
        format_settings["needs_metrics"] = True

    elif document_type.lower().startswith("manual"):
        format_settings["tone"] = "instructional"
        format_settings["needs_executive_summary"] = False
        format_settings["needs_visuals"] = True

    elif document_type.lower().startswith("technical analysis"):
        format_settings["tone"] = "analytical"
        format_settings["needs_metrics"] = True
        format_settings["needs_visuals"] = True

    elif document_type.lower().startswith("data paper"):
        format_settings["tone"] = "analytical"
        format_settings["needs_metrics"] = True
        format_settings["needs_visuals"] = True

    # Generate document title based on task and document type - using only factual information
    title_prompt = f"""
    Create a professional, concise title for a {document_type} based ONLY on the following task and actual results:
    
    TASK: {task}
    
    ACTUAL FINDINGS: {final_result}
    
    The title should be descriptive, professional, and no more than 10 words.
    It MUST be based ONLY on the factual information provided, with no additional fabricated content.
    Respond with ONLY the title text.
    """

    title_response = await report_llm.ainvoke(title_prompt)
    document_title = title_response.content.strip()

    # Only extract metrics if we have sufficient data and the format requires it
    key_metrics = ""
    if format_settings["needs_metrics"] and visited_urls:
        metrics_prompt = f"""
        Based ONLY on the following ACTUAL browser results, identify key metrics or data points 
        that were directly observed during the browsing session:
        
        TASK: {task}
        
        ACTUAL FINDINGS: {final_result}
        
        CONTENT EXTRACTED:
        {all_available_content[:1000] if all_available_content else "No content extracted"}
        
        VISITED URLS: {', '.join(visited_urls) if visited_urls else "None recorded"}
        
        Identify ONLY metrics or data points that were EXPLICITLY mentioned in the actual results.
        DO NOT fabricate, estimate, or invent metrics that weren't directly observed.
        Respond with a numbered list of metrics. If no clear metrics are available, respond with "No metrics available in the results."
        """

        metrics_response = await report_llm.ainvoke(metrics_prompt)
        key_metrics = metrics_response.content.strip()

        if key_metrics.lower() == "no metrics available in the results.":
            # Disable metrics if none were found
            format_settings["needs_metrics"] = False
            key_metrics = ""

    # Step 2: Determine appropriate sections based on the task, domain, and document type
    # Adjust section count based on document type
    min_sections = 3 if document_type.lower().startswith("summary") else 4
    max_sections = 5 if document_type.lower().startswith("summary") else 8

    sections_prompt = f"""
    Based ONLY on the following ACTUAL information from the browsing session, suggest appropriate sections for a {document_type}:
    
    TASK: {task}
    
    DOMAIN: {task_domain}
    
    DOCUMENT TYPE: {document_type}
    
    DOCUMENT TITLE: {document_title}
    
    ACTUAL FINDINGS: {final_result}
    
    VISITED URLS: {', '.join(visited_urls) if visited_urls else "None recorded"}
    
    {"KEY METRICS FOUND:\n" + key_metrics if key_metrics else "No metrics available in the results."}
    
    Respond ONLY with a numbered list of {min_sections}-{max_sections} section titles that would be appropriate for organizing 
    the ACTUAL information obtained. The sections should follow best practices for a {document_type}.
    
    DO NOT suggest sections that would require information not found in the actual results.
    {("Include an executive summary section" if format_settings["needs_executive_summary"] else "")}
    {("Include a conclusion section based only on the actual findings" if format_settings["needs_conclusion"] else "")}
    """

    # Get dynamic sections based on the task and document type
    sections_response = await report_llm.ainvoke(sections_prompt)
    dynamic_sections = sections_response.content.strip()

    # Generate an executive summary if needed - based only on actual results
    executive_summary = ""
    if format_settings["needs_executive_summary"]:
        summary_prompt = f"""
        Create a concise executive summary (2-3 paragraphs) based ONLY on the ACTUAL results of this browser session:
        
        TITLE: {document_title}
        
        TASK: {task}
        
        DOMAIN: {task_domain}
        
        ACTUAL FINDINGS: {final_result}
        
        VISITED URLS: {', '.join(visited_urls) if visited_urls else "None recorded"}
        
        Create a factual executive summary that includes ONLY information directly obtained from the browser results.
        DO NOT fabricate, assume, or add any information that wasn't explicitly found during the browsing session.
        Respond with ONLY the executive summary text in a {format_settings["tone"]} tone.
        """

        summary_response = await report_llm.ainvoke(summary_prompt)
        executive_summary = summary_response.content.strip()

    # Step 3: Generate the document with the appropriate format and sections - strictly using only actual information
    prompt = f"""
    Create a professional {document_type} based ONLY on the ACTUAL information collected during this browser session:
    
    TITLE: {document_title}
    
    TASK: {task}
    
    DOMAIN: {task_domain}
    
    {"EXECUTIVE SUMMARY:\n" + executive_summary if executive_summary else ""}
    
    COMPLETION STATUS: {"Completed" if is_done else "Incomplete"}
    
    ERRORS: {"Yes" if has_errors else "No"}
    
    ACTUAL FINDINGS: {final_result}
    
    AGENT THOUGHTS:
    {thoughts_text}
    
    WEBSITES VISITED:
    {', '.join(visited_urls) if visited_urls else "None recorded"}
    
    CONTENT EXTRACTED (LIMITED SAMPLE):
    {all_available_content[:1500] if all_available_content else "No content was extracted."}
    
    {"KEY METRICS FOUND:\n" + key_metrics if key_metrics and format_settings["needs_metrics"] else ""}
    
    DOCUMENT SECTIONS:
    {dynamic_sections}
    
    DOCUMENT TONE: {format_settings["tone"]}
    
    Please follow these guidelines:
    1. Format this as a professional {document_type} with the title "{document_title}"
    2. Structure the document according to the specified sections
    {"3. Begin with the executive summary provided above" if executive_summary else ""}
    4. Include ONLY information that was ACTUALLY obtained during the browser session
    5. DO NOT fabricate, assume, or create any information that wasn't directly observed
    6. Use markdown formatting with proper headers, bullet points, tables where appropriate
    {"7. Include only the metrics that were actually found in the results" if format_settings["needs_metrics"] and key_metrics else ""}
    {"8. Only suggest visualizations for data that was actually collected" if format_settings["needs_visuals"] else ""}
    {"9. Only include citations to sources that were actually visited" if format_settings["needs_citations"] else ""}
    {"10. End with conclusions based strictly on the collected information" if format_settings["needs_conclusion"] else ""}
    11. If there is insufficient information for a section, state this clearly rather than fabricating content
    
    Format the document with Markdown using:
    - {format_settings["heading_style"]} for main headings
    - {format_settings["subheading_style"]} for subheadings
    - Bullet points and numbered lists where appropriate
    - {format_settings["emphasis"]}Bold{format_settings["emphasis"]} for emphasis on important points
    - Tables using markdown table syntax for structured data (only if actual data is available)
    - > Blockquotes for directly quoting content from visited websites
    
    The document should be factual, professionally formatted, and written in a {format_settings["tone"]} tone.
    It is CRITICAL that you include ONLY information that was actually obtained during the browser session.
    """

    # Handle potential errors
    try:
        # Generate document using LLM
        response = await report_llm.ainvoke(prompt)
        document_text = response.content

        # Format and save the document
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        doc_type_simple = document_type.split(
            '(')[0].strip().lower().replace(' ', '_')
        document_filename = f"{doc_type_simple}_{timestamp}.md"

        # Add document title as first line if not already present
        if not document_text.startswith("# "):
            document_text = f"# {document_title}\n\n{document_text}"

        with open(document_filename, "w") as f:
            f.write(document_text)

        print(f"Document generated and saved to {document_filename}")
        return document_text
    except Exception as e:
        error_message = f"Error generating document: {str(e)}"
        print(error_message)

        # Create a simple error document
        error_doc = f"""# Error Report

## Task Information
- Task: {task}
- Completion Status: {"Completed" if is_done else "Incomplete"}
- Errors Encountered: {"Yes" if has_errors else "No"}

## Error Details
{error_message}

## Available Data
{final_result}
"""

        # Save error document
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        error_filename = f"error_report_{timestamp}.md"

        with open(error_filename, "w") as f:
            f.write(error_doc)

        print(f"Error report generated and saved to {error_filename}")
        return error_doc


async def main():
    # Initialize the agent with the task and language model
    agent = Agent(
        task=task,
        llm=llm,
        browser=browser,
        planner_llm=planner_llm,
        use_vision_for_planner=False,
        generate_gif=False
    )

    # Run the agent and get results asynchronously
    result = await agent.run()

    print("Final Result:", result.final_result())
    print("Is Done:", result.is_done())
    print("Has Errors:", result.has_errors())
    print("\nModel Thoughts:")
    for thought in result.model_thoughts():
        print(thought)

    print("\nAction Results:")
    for action in result.action_results():
        if hasattr(action, 'extracted_content'):
            print(action.extracted_content, end="\r", flush=True)
        print("\n")

    # Generate and display the document
    print("\n=== GENERATING DOCUMENT ===\n")
    document = await generate_report(result)
    print("\n=== DOCUMENT PREVIEW ===\n")
    print(document[:500] + "...\n" if len(document) > 500 else document)

    await browser.close()

# Run the asynchronous main function
asyncio.run(main())
