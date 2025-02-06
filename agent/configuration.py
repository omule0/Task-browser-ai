import os
from dataclasses import dataclass, field, fields
from typing import Any, Optional

from langchain_core.runnables import RunnableConfig
from typing_extensions import Annotated
from dataclasses import dataclass


@dataclass(kw_only=True)
class Configuration:
    """The configurable fields for the research assistant."""
    topic: str = ""  # Research topic
    max_analysts: int = 2  # Default number of analysts
    human_analyst_feedback: str = ""  # Human feedback on analysts
    template_feedback: str = "approve"  # Feedback on report template
    report_template: str = ""  # Generated report template

    @classmethod
    def from_runnable_config(
        cls, config: Optional[RunnableConfig] = None
    ) -> "Configuration":
        """Create a Configuration instance from a RunnableConfig."""
        configurable = (
            config["configurable"] if config and "configurable" in config else {}
        )
        values: dict[str, Any] = {
            f.name: os.environ.get(f.name.upper(), configurable.get(f.name))
            for f in fields(cls)
            if f.init
        }
        return cls(**{k: v for k, v in values.items() if v})
