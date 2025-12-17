"""
UI command definitions for agent-to-frontend communication.
"""

from typing import Literal, Optional, List
from dataclasses import dataclass, asdict, field
import json


@dataclass
class NavigateCommand:
    """Navigate to a different file or step."""
    to: str  # "next", "previous", or specific file path
    type: Literal["navigate"] = "navigate"


@dataclass
class ShowConnectionsCommand:
    """Show how a file connects to other files."""
    file: str
    type: Literal["showConnections"] = "showConnections"


@dataclass
class ExpandSectionCommand:
    """Expand a specific section in the UI."""
    file: str
    section: Literal["purpose", "gotchas", "history"]
    type: Literal["expandSection"] = "expandSection"


@dataclass
class HighlightCodeCommand:
    """Highlight specific lines in a file."""
    file: str
    lines: tuple[int, int]
    type: Literal["highlightCode"] = "highlightCode"


@dataclass
class OpenSidebarCommand:
    """Open the file tree sidebar."""
    type: Literal["openSidebar"] = "openSidebar"


@dataclass
class ShowFileCommand:
    """Show a file with knowledge context and optional code excerpt.
    
    This is the primary command for guided onboarding - it tells the UI
    to display the file's knowledge card along with a relevant code snippet.
    """
    file: str  # File path relative to repo root
    title: str  # What the agent is explaining (e.g., "Request Handler")
    explanation: str  # Brief explanation for this segment
    startLine: Optional[int] = None  # If set, show code from this line
    endLine: Optional[int] = None  # If set, show code to this line
    highlightLines: Optional[List[int]] = None  # Lines to highlight
    featureName: Optional[str] = None  # Feature this belongs to
    type: Literal["showFile"] = "showFile"


# Union type for all commands
UICommand = (
    NavigateCommand
    | ShowConnectionsCommand
    | ExpandSectionCommand
    | HighlightCodeCommand
    | OpenSidebarCommand
    | ShowFileCommand
)


def serialize_command(command: UICommand) -> bytes:
    """Serialize a command to JSON bytes for data channel."""
    return json.dumps(asdict(command)).encode("utf-8")

