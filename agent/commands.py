"""
UI command definitions for agent-to-frontend communication.
"""

from typing import Literal, Optional
from dataclasses import dataclass, asdict
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


# Union type for all commands
UICommand = (
    NavigateCommand
    | ShowConnectionsCommand
    | ExpandSectionCommand
    | HighlightCodeCommand
    | OpenSidebarCommand
)


def serialize_command(command: UICommand) -> bytes:
    """Serialize a command to JSON bytes for data channel."""
    return json.dumps(asdict(command)).encode("utf-8")

