from typing import Annotated, List, TypedDict, NotRequired
from pydantic import BaseModel, Field
from enum import Enum
import operator


class Section(BaseModel):
    name: str = Field(
        description="Name for this section of the report.",
    )
    description: str = Field(
        description="Brief overview of the main topics and concepts to be covered in this section.",
    )
    research: bool = Field(
        description="Whether to perform web research for this section of the report."
    )
    content: str = Field(
        description="The content of the section."
    )


class Sections(BaseModel):
    sections: List[Section] = Field(
        description="Sections of the report.",
    )


class SearchQuery(BaseModel):
    search_query: str = Field(None, description="Query for web search.")


class Queries(BaseModel):
    queries: List[SearchQuery] = Field(
        description="List of search queries.",
    )


class ReportStateInput(TypedDict):
    topic: str  # Report topic
    feedback_on_report_plan: str  # Feedback on the report structure from review
    accept_report_plan: bool  # Whether to accept or reject the report plan
    report_structure: str  # Organization/structure for the report
    # Number of search queries to generate (default: 2)
    number_of_queries: NotRequired[int]
    # Type of search to perform (default: 'general')
    tavily_topic: NotRequired[str]
    # Number of days to look back for news articles (optional)
    tavily_days: NotRequired[int]


class ReportStateOutput(TypedDict):
    final_report: str  # Final report


class ReportState(TypedDict):
    topic: str  # Report topic
    feedback_on_report_plan: str  # Feedback on the report structure from review
    accept_report_plan: bool  # Whether to accept or reject the report plan
    report_structure: str  # Organization/structure for the report
    number_of_queries: int  # Number of search queries to generate (default: 2)
    tavily_topic: str  # Type of search to perform (default: 'general')
    # Number of days to look back for news articles (optional)
    tavily_days: NotRequired[int]
    sections: list[Section]  # List of report sections
    completed_sections: Annotated[list, operator.add]  # Send() API key
    # String of any completed sections from research to write final sections
    report_sections_from_research: str
    final_report: str  # Final report


class SectionState(TypedDict):
    section: Section  # Report section
    search_queries: list[SearchQuery]  # List of search queries
    source_str: str  # String of formatted source content from web search
    # String of any completed sections from research to write final sections
    report_sections_from_research: str
    # Final key we duplicate in outer state for Send() API
    completed_sections: list[Section]
    number_of_queries: int  # Number of search queries to generate (default: 2)
    tavily_topic: str  # Type of search to perform (default: 'general')
    # Number of days to look back for news articles (optional)
    tavily_days: NotRequired[int]


class SectionOutputState(TypedDict):
    # Final key we duplicate in outer state for Send() API
    completed_sections: list[Section]
