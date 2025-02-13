import operator
from pydantic import BaseModel, Field
from typing import Annotated, List
from typing_extensions import TypedDict

from langchain_community.document_loaders import WikipediaLoader
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_community.utilities.bing_search import BingSearchAPIWrapper
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, get_buffer_string
from langchain_openai import ChatOpenAI

from langgraph.constants import Send
from langgraph.graph import END, MessagesState, START, StateGraph

# LLM

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)


# Schema


class Analyst(BaseModel):
    affiliation: str = Field(
        description="Primary affiliation of the analyst.",
    )
    name: str = Field(
        description="Name of the analyst."
    )
    role: str = Field(
        description="Role of the analyst in the context of the topic.",
    )
    description: str = Field(
        description="Description of the analyst focus, concerns, and motives.",
    )

    @property
    def persona(self) -> str:
        return f"Name: {self.name}\nRole: {self.role}\nAffiliation: {self.affiliation}\nDescription: {self.description}\n"


class Perspectives(BaseModel):
    analysts: List[Analyst] = Field(
        description="Comprehensive list of analysts with their roles and affiliations.",
    )


class GenerateAnalystsState(TypedDict):
    topic: str  # Research topic
    human_analyst_feedback: str  # Human feedback
    template_feedback: str  # Human feedback on template
    analysts: List[Analyst]  # Analyst asking questions
    report_template: str  # Generated report template
    progress_messages: Annotated[list, operator.add]  # Progress messages


class InterviewState(MessagesState):
    max_num_turns: int  # Number turns of conversation
    context: Annotated[list, operator.add]  # Source docs
    analyst: Analyst  # Analyst asking questions
    interview: str  # Interview transcript
    sections: list  # Final key we duplicate in outer state for Send() API
    progress_messages: Annotated[list, operator.add]  # Progress messages


class SearchQuery(BaseModel):
    search_query: str = Field(None, description="Search query for retrieval.")


class ResearchGraphState(TypedDict):
    topic: str  # Research topic
    human_analyst_feedback: str  # Human feedback
    template_feedback: str  # Human feedback on template
    analysts: List[Analyst]  # Analyst asking questions
    sections: Annotated[list, operator.add]  # Send() API key
    report_template: str  # Generated report template
    final_report: str  # Final report
    progress_messages: Annotated[list, operator.add]  # Progress messages

# Nodes and edges


analyst_instructions = """You are tasked with creating a set of AI analyst personas. Follow these instructions carefully:

1. First, review the research topic:
{topic}
        
2. Examine any editorial feedback that has been optionally provided to guide creation of the analysts: 
        
{human_analyst_feedback}
    
3. Determine the most interesting themes based upon documents and / or feedback above.
                    
4. Pick the top 2 themes.

5. Assign one analyst to each theme."""

template_instructions = """You are a technical writer tasked with creating a report template outline.

Your goal is to create a structured outline that will guide the final report on this topic:
{topic}

The template should:
1. Use markdown formatting
2. Include placeholder sections that will be filled in later
3. Provide brief descriptions of what should go in each section
4. Follow academic/technical writing best practices

Do not write any actual content - only create the structure and descriptions."""

template_modification_instructions = """You are a technical writer tasked with modifying an existing report template outline.

Here is the current template:

{current_template}

The following feedback has been provided for modifications:

{template_feedback}

Your task:
1. Carefully review the existing template structure
2. Apply the requested changes from the feedback
3. Maintain the overall coherence of the template
4. Keep any sections that weren't mentioned in the feedback
5. Ensure all sections still have clear descriptions
6. Use consistent markdown formatting throughout

Guidelines:
- Only modify sections mentioned in the feedback
- Keep the same formatting style
- Maintain the same level of detail in descriptions
- Ensure the modified template flows logically
- Preserve any useful elements from the original template

Return the complete modified template."""


def start_template_generation(state: GenerateAnalystsState):
    """ Node to send initial template generation message """
    return {"progress_messages": ["🔄 Generating a structured report template for your research topic..."]}


def generate_template(state: GenerateAnalystsState):
    """ Generate or modify a report template based on the topic and feedback """
    topic = state['topic']
    template_feedback = state.get('template_feedback', '')
    current_template = state.get('report_template', '')

    # If there's no existing template or no feedback, generate a new one
    if not current_template or not template_feedback or template_feedback.lower() == 'approve':
        template = llm.invoke([
            SystemMessage(content=template_instructions.format(topic=topic)),
            HumanMessage(content="Generate a report template outline.")
        ])
        return {"report_template": template.content}
    else:
        # Modify existing template based on feedback
        template = llm.invoke([
            SystemMessage(content=template_modification_instructions.format(
                current_template=current_template,
                template_feedback=template_feedback
            )),
            HumanMessage(
                content="Modify the template according to the provided feedback.")
        ])
        return {"report_template": template.content}


def complete_template_generation(state: GenerateAnalystsState):
    """ Node to send template completion message """
    return {"progress_messages": ["✅ Template generation complete! Please review and provide any feedback."]}


def start_analyst_creation(state: GenerateAnalystsState):
    """ Node to send initial analyst creation message """
    return {"progress_messages": ["🤖 Creating specialized AI analysts for your research topic..."]}


def create_analysts(state: GenerateAnalystsState):
    """ Create analysts """
    topic = state['topic']
    human_analyst_feedback = state.get('human_analyst_feedback', '')

    # Enforce structured output
    structured_llm = llm.with_structured_output(Perspectives)

    # System message
    system_message = analyst_instructions.format(topic=topic,
                                                 human_analyst_feedback=human_analyst_feedback)

    # Generate question
    analysts = structured_llm.invoke([SystemMessage(
        content=system_message)]+[HumanMessage(content="Generate the set of analysts.")])

    return {"analysts": analysts.analysts}


def complete_analyst_creation(state: GenerateAnalystsState):
    """ Node to send analyst creation completion message """
    return {"progress_messages": ["✅ AI analysts have been created and are ready to begin research."]}


def human_feedback(state: GenerateAnalystsState):
    """ No-op node that should be interrupted on """
    pass


# Generate analyst question
question_instructions = """You are an analyst tasked with interviewing an expert to learn about a specific topic. 

Your goal is boil down to interesting and specific insights related to your topic.

1. Interesting: Insights that people will find surprising or non-obvious.
        
2. Specific: Insights that avoid generalities and include specific examples from the expert.

Here is your topic of focus and set of goals: {goals}
        
Begin by introducing yourself using a name that fits your persona, and then ask your question.

Continue to ask questions to drill down and refine your understanding of the topic.
        
When you are satisfied with your understanding, complete the interview with: "Thank you so much for your help!"

Remember to stay in character throughout your response, reflecting the persona and goals provided to you."""


def generate_question(state: InterviewState):
    """ Node to generate a question """

    # Get state
    analyst = state.get("analyst")
    if not analyst:
        raise ValueError(
            "Analyst not found in state. Make sure the analyst is properly initialized.")

    messages = state.get("messages", [])

    # Generate question
    system_message = question_instructions.format(goals=analyst.persona)
    question = llm.invoke([SystemMessage(content=system_message)]+messages)

    # Write messages to state
    return {"messages": [question]}


# Search query writing
search_instructions = SystemMessage(content="""You will be given a conversation between an analyst and an expert.

Your goal is to generate a well-structured query for use in retrieval and / or web-search related to the conversation.

First, analyze the full conversation.

Pay particular attention to the final question posed by the analyst.

Convert this final question into a well-structured web search query""")


def search_bing(state: InterviewState):
    """ Retrieve docs from Bing search """
    try:
        # Search query
        structured_llm = llm.with_structured_output(SearchQuery)
        search_query = structured_llm.invoke(
            [search_instructions]+state['messages'])

        # Search
        bing_search = BingSearchAPIWrapper()
        search_results = bing_search.results(
            search_query.search_query, num_results=3)

        # Format results
        formatted_docs = []
        for result in search_results:
            doc_start = '<Document source="Bing Search Result" href="'
            doc_middle = '"/>\n'
            doc_end = '\n</Document>'
            doc = doc_start + result["link"] + \
                doc_middle + result["snippet"] + doc_end
            formatted_docs.append(doc)

        formatted_search_docs = "\n\n---\n\n".join(formatted_docs)
        return {"context": [formatted_search_docs]}
    except Exception as e:
        print("All searches failed. Returning empty results.")
        return {"context": ["<Document source='No results'>Search failed to return results.</Document>"]}


def search_web(state: InterviewState):
    """ Retrieve docs from web search """
    try:
        # Search
        tavily_search = TavilySearchResults(max_results=3)

        # Search query
        structured_llm = llm.with_structured_output(SearchQuery)
        search_query = structured_llm.invoke(
            [search_instructions]+state['messages'])

        # Search
        search_docs = tavily_search.invoke(search_query.search_query)

        # Format
        formatted_search_docs = "\n\n---\n\n".join(
            [f'<Document href="{doc["url"]}"/>\n{doc["content"]}\n</Document>'
             for doc in search_docs]
        )

        return {"context": [formatted_search_docs]}
    except Exception as e:
        bing_result = search_bing(state)
        return bing_result


def search_wikipedia(state: InterviewState):
    """ Retrieve docs from wikipedia """
    try:
        # Search query
        structured_llm = llm.with_structured_output(SearchQuery)
        search_query = structured_llm.invoke(
            [search_instructions]+state['messages'])

        # Search
        search_docs = WikipediaLoader(
            query=search_query.search_query, load_max_docs=2).load()

        # Format
        formatted_search_docs = "\n\n---\n\n".join([
            '<Document source="' + doc.metadata["source"] + '" page="' + doc.metadata.get(
                "page", "") + '"/>\n' + doc.page_content + '\n</Document>'
            for doc in search_docs
        ])

        return {"context": [formatted_search_docs]}
    except Exception as e:
        print("Wikipedia search failed. Falling back to Bing.")
        return search_bing(state)


# Generate expert answer
answer_instructions = """You are an expert being interviewed by an analyst.

Here is analyst area of focus: {goals}. 
        
You goal is to answer a question posed by the interviewer.

To answer question, use this context:
        
{context}

When answering questions, follow these guidelines:
        
1. Use only the information provided in the context. 
        
2. Do not introduce external information or make assumptions beyond what is explicitly stated in the context.

3. The context contain sources at the topic of each individual document.

4. Include these sources your answer next to any relevant statements. For example, for source # 1 use [1]. 

5. List your sources in order at the bottom of your answer. [1] Source 1, [2] Source 2, etc
        
6. If the source is: <Document source="assistant/docs/llama3_1.pdf" page="7"/>' then just list: 
        
[1] assistant/docs/llama3_1.pdf, page 7 
        
And skip the addition of the brackets as well as the Document source preamble in your citation."""


def generate_answer(state: InterviewState):
    """ Node to answer a question """

    # Get state
    analyst = state["analyst"]
    messages = state["messages"]
    context = state["context"]

    # Answer question
    system_message = answer_instructions.format(
        goals=analyst.persona, context=context)
    answer = llm.invoke([SystemMessage(content=system_message)]+messages)

    # Name the message as coming from the expert
    answer.name = "expert"

    # Append it to state
    return {"messages": [answer]}


def save_interview(state: InterviewState):
    """ Save interviews """

    # Get messages
    messages = state["messages"]

    # Convert interview to a string
    interview = get_buffer_string(messages)

    # Save to interviews key
    return {"interview": interview}


def route_messages(state: InterviewState,
                   name: str = "expert"):
    """ Route between question and answer """

    # Get messages
    messages = state["messages"]
    max_num_turns = state.get('max_num_turns', 2)

    # Check the number of expert answers
    num_responses = len(
        [m for m in messages if isinstance(m, AIMessage) and m.name == name]
    )

    # End if expert has answered more than the max turns
    if num_responses >= max_num_turns:
        return 'save_interview'

    # This router is run after each question - answer pair
    # Get the last question asked to check if it signals the end of discussion
    last_question = messages[-2]

    if "Thank you so much for your help" in last_question.content:
        return 'save_interview'
    return "ask_question"


# Write a summary (section of the final report) of the interview
section_writer_instructions = """You are an expert technical writer. 
            
Your task is to create a short, easily digestible section of a report based on a set of source documents.

1. Analyze the content of the source documents: 
- The name of each source document is at the start of the document, with the <Document tag.
        
2. Create a report structure using markdown formatting:
- Use ## for the section title
- Use ### for sub-section headers
        
3. Write the report following this structure:
a. Title (## header)
b. Summary (### header)
c. Sources (### header)

4. Make your title engaging based upon the focus area of the analyst: 
{focus}

5. For the summary section:
- Set up summary with general background / context related to the focus area of the analyst
- Emphasize what is novel, interesting, or surprising about insights gathered from the interview
- Create a numbered list of source documents, as you use them
- Do not mention the names of interviewers or experts
- Aim for approximately 400 words maximum
- Use numbered sources in your report (e.g., [1], [2]) based on information from source documents
        
6. In the Sources section:
- Include all sources used in your report
- Provide full links to relevant websites or specific document paths
- Separate each source by a newline. Use two spaces at the end of each line to create a newline in Markdown.
- It will look like:

### Sources
[1] Link or Document name
[2] Link or Document name

7. Be sure to combine sources. For example this is not correct:

[3] https://ai.meta.com/blog/meta-llama-3-1/
[4] https://ai.meta.com/blog/meta-llama-3-1/

There should be no redundant sources. It should simply be:

[3] https://ai.meta.com/blog/meta-llama-3-1/
        
8. Final review:
- Ensure the report follows the required structure
- Include no preamble before the title of the report
- Check that all guidelines have been followed"""


def write_section(state: InterviewState):
    """ Node to write a section """

    # Get state
    interview = state["interview"]
    context = state["context"]
    analyst = state["analyst"]

    # Write section using either the gathered source docs from interview (context) or the interview itself (interview)
    system_message = section_writer_instructions.format(
        focus=analyst.description)
    section = llm.invoke([SystemMessage(content=system_message)] +
                         [HumanMessage(content=f"Use this source to write your section: {context}")])

    # Append it to state
    return {"sections": [section.content]}


# Add nodes and edges
interview_builder = StateGraph(InterviewState)
interview_builder.add_node("ask_question", generate_question)
interview_builder.add_node("search_web", search_web)
interview_builder.add_node("search_wikipedia", search_wikipedia)
interview_builder.add_node("search_bing", search_bing)
interview_builder.add_node("answer_question", generate_answer)
interview_builder.add_node("save_interview", save_interview)
interview_builder.add_node("write_section", write_section)

# Flow
interview_builder.add_edge(START, "ask_question")
interview_builder.add_edge("ask_question", "search_web")
interview_builder.add_edge("ask_question", "search_wikipedia")
interview_builder.add_edge("ask_question", "search_bing")
interview_builder.add_edge("search_web", "answer_question")
interview_builder.add_edge("search_wikipedia", "answer_question")
interview_builder.add_edge("search_bing", "answer_question")
interview_builder.add_conditional_edges("answer_question", route_messages, [
                                        'ask_question', 'save_interview'])
interview_builder.add_edge("save_interview", "write_section")
interview_builder.add_edge("write_section", END)


def initiate_all_interviews(state: ResearchGraphState):
    """ Conditional edge to initiate all interviews via Send() API or return to create_analysts """

    # Check if human feedback
    human_analyst_feedback = state.get('human_analyst_feedback', 'approve')
    if human_analyst_feedback.lower() != 'approve':
        # Return to create_analysts
        return "create_analysts"

    # Otherwise kick off interviews in parallel via Send() API
    else:
        topic = state.get("topic")
        analysts = state.get("analysts", [])
        template = state.get("report_template")

        if not topic or not analysts:
            raise ValueError(
                "Topic or analysts not found in state. Make sure they are properly initialized.")

        if not template:
            raise ValueError(
                "Report template not found in state. Make sure template generation completed successfully.")

        return [Send("conduct_interview", {
            "analyst": analyst,
            "max_num_turns": 2,
            "messages": [HumanMessage(content=f"So you said you were writing an article on {topic}?")]
        }) for analyst in analysts]


# Write a report based on the interviews and template
report_writer_instructions = """You are a technical writer creating a report on this overall topic: 

{topic}
    
You have a team of analysts. Each analyst has done two things: 
1. They conducted an interview with an expert on a specific sub-topic.
2. They write up their finding into a memo.

Here is the template you MUST follow for your report:

{template}

Your task: 
1. You will be given a collection of memos from your analysts.
2. Think carefully about the insights from each memo.
3. Write a COMPLETE report following the template structure EXACTLY.
4. Ensure each section of the template is filled with relevant content from the memos.
5. Include all sections from the template (introduction, body sections, conclusion, etc.).
6. Maintain a cohesive narrative throughout the report.

Guidelines:
1. Use markdown formatting as specified in the template
2. Do not mention any analyst names in your report
3. Preserve any citations from the memos (in brackets, e.g., [1] or [2])
4. Create a final, consolidated list of sources in a Sources section
5. List sources in order without repetition
6. Follow the template structure EXACTLY - do not add or remove sections

Here are the memos from your analysts to build your report from: 

{context}"""


def pre_report_message(state: ResearchGraphState):
    """ Node to provide a message before starting the final report """
    return {"progress_messages": ["📊 Compiling all research findings into the final report..."]}


def write_complete_report(state: ResearchGraphState):
    """ Node to write the complete report following the template """

    # Get all required state
    sections = state["sections"]
    topic = state["topic"]
    template = state.get("report_template", "")

    if not template:
        raise ValueError(
            "Report template not found in state. Make sure template generation step completed successfully.")

    # Concat all sections together
    formatted_str_sections = "\n\n".join(
        [f"{section}" for section in sections])

    # Generate the complete report following the template
    system_message = report_writer_instructions.format(
        topic=topic,
        template=template,
        context=formatted_str_sections
    )
    report = llm.invoke([SystemMessage(content=system_message)] +
                        [HumanMessage(content=f"Write a complete report following the provided template structure exactly.")])

    progress_msg = "✅ Final report generation complete!"
    return_state = {"progress_messages": [progress_msg]}
    return_state["final_report"] = report.content
    return return_state


def template_feedback_node(state: GenerateAnalystsState):
    """ No-op node that should be interrupted on for template feedback """
    pass


def handle_template_feedback(state: ResearchGraphState):
    """ Conditional edge to either regenerate template or proceed """

    # Check if template feedback
    template_feedback = state.get('template_feedback', 'approve')

    # If feedback is just 'approve', proceed to analyst creation
    if template_feedback.lower() == 'approve':
        return "start_analyst_creation"

    # If there's actual feedback, return to template generation
    # The feedback will be used to modify the template
    return "generate_template"


def pre_research_message(state: ResearchGraphState):
    """ Node to inform user about research duration """
    return {"progress_messages": ["🔍 Starting the research process. This may take about 3 minutes..."]}


# Add nodes and edges
builder = StateGraph(ResearchGraphState)
builder.add_node("start_template_generation", start_template_generation)
builder.add_node("generate_template", generate_template)
builder.add_node("complete_template_generation", complete_template_generation)
builder.add_node("template_feedback_node", template_feedback_node)
builder.add_node("start_analyst_creation", start_analyst_creation)
builder.add_node("create_analysts", create_analysts)
builder.add_node("complete_analyst_creation", complete_analyst_creation)
builder.add_node("human_feedback", human_feedback)
builder.add_node("pre_research_message", pre_research_message)
builder.add_node("conduct_interview", interview_builder.compile())
builder.add_node("pre_report_message", pre_report_message)
builder.add_node("write_complete_report", write_complete_report)

# Logic
builder.add_edge(START, "start_template_generation")
builder.add_edge("start_template_generation", "generate_template")
builder.add_edge("generate_template", "complete_template_generation")
builder.add_edge("complete_template_generation", "template_feedback_node")
builder.add_conditional_edges("template_feedback_node", handle_template_feedback, [
    "generate_template", "start_analyst_creation"])
builder.add_edge("start_analyst_creation", "create_analysts")
builder.add_edge("create_analysts", "complete_analyst_creation")
builder.add_edge("complete_analyst_creation", "human_feedback")
builder.add_edge("human_feedback", "pre_research_message")
builder.add_conditional_edges("pre_research_message", initiate_all_interviews, [
    "start_analyst_creation", "conduct_interview"])
builder.add_edge("conduct_interview", "pre_report_message")
builder.add_edge("pre_report_message", "write_complete_report")
builder.add_edge("write_complete_report", END)

# Compile
graph = builder.compile(
    interrupt_before=['template_feedback_node', 'human_feedback'])
