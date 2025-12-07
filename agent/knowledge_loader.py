"""
Load and format knowledge files for the agent's context.
"""

import os
import json
from pathlib import Path
from typing import Dict, List, Optional
try:
    import frontmatter
except ImportError:
    # Fallback if frontmatter not available
    frontmatter = None


def load_session(repo_root: str) -> Optional[Dict]:
    """Load the onboarding session data."""
    sessions_dir = Path(repo_root) / ".startblock" / "sessions"
    
    if not sessions_dir.exists():
        return None
    
    # Find the most recent session file
    session_files = sorted(
        sessions_dir.glob("session-*.json"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )
    
    if not session_files:
        return None
    
    try:
        with open(session_files[0], "r") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading session: {e}")
        return None


def load_knowledge_file(knowledge_dir: Path, file_path: str) -> Optional[Dict]:
    """Load a single knowledge file and parse its content."""
    knowledge_file = knowledge_dir / f"{file_path}.md"
    
    if not knowledge_file.exists():
        return None
    
    try:
        if not frontmatter:
            # Fallback: read file and parse manually
            with open(knowledge_file, "r", encoding="utf-8") as f:
                content = f.read()
            # Simple YAML frontmatter parser
            if content.startswith("---"):
                parts = content.split("---", 2)
                if len(parts) >= 3:
                    metadata = {}
                    for line in parts[1].strip().split("\n"):
                        if ":" in line:
                            key, value = line.split(":", 1)
                            metadata[key.strip()] = value.strip().strip('"').strip("'")
                    content = parts[2].strip()
                else:
                    metadata = {}
            else:
                metadata = {}
        else:
            with open(knowledge_file, "r", encoding="utf-8") as f:
                post = frontmatter.load(f)
                metadata = post.metadata
                content = post.content
            
            # Extract sections from markdown content
            sections = {
                "purpose": _extract_section(content, "Purpose"),
                "gotchas": _extract_section(content, "Gotchas"),
                "dependencies": _extract_section(content, "Dependencies"),
                "architecture": _extract_section(content, "Architecture Context"),
                "insights": _extract_section(content, "Insights") or _extract_section(content, "Developer Insights"),
            }
            
            return {
                "sourceFile": file_path,
                "tags": metadata.get("tags", []) if isinstance(metadata.get("tags"), list) else [],
                "importance": metadata.get("importance"),
                "lastUpdated": metadata.get("lastUpdated", ""),
                "sections": sections,
            }
    except Exception as e:
        print(f"Error loading knowledge file {file_path}: {e}")
        return None


def _extract_section(content: str, section_name: str) -> Optional[str]:
    """Extract a section from markdown content by header."""
    import re
    
    # Match section header (## Section Name or ### Section Name)
    pattern = rf"##+\s+{re.escape(section_name)}\s*\n([\s\S]*?)(?=\n##|\n#|$)"
    match = re.search(pattern, content, re.IGNORECASE)
    
    if match:
        return match.group(1).strip()
    return None


def get_context_for_file(repo_root: str, file_path: str) -> str:
    """Get formatted knowledge context for a specific file."""
    knowledge_dir = Path(repo_root) / ".startblock" / "knowledge"
    knowledge = load_knowledge_file(knowledge_dir, file_path)
    
    if not knowledge:
        return f"No knowledge available for {file_path}"
    
    context_parts = [f"# Knowledge about {file_path}"]
    
    if knowledge.get("purpose"):
        context_parts.append(f"\n## Purpose\n{knowledge['purpose']}")
    
    if knowledge.get("gotchas"):
        context_parts.append(f"\n## Gotchas (Important!)\n{knowledge['gotchas']}")
    
    if knowledge.get("dependencies"):
        context_parts.append(f"\n## Dependencies\n{knowledge['dependencies']}")
    
    if knowledge.get("architecture"):
        context_parts.append(f"\n## Architecture\n{knowledge['architecture']}")
    
    if knowledge.get("insights"):
        context_parts.append(f"\n## Insights\n{knowledge['insights']}")
    
    if knowledge.get("tags"):
        context_parts.append(f"\nTags: {', '.join(knowledge['tags'])}")
    
    return "\n".join(context_parts)


def get_journey_context(repo_root: str) -> str:
    """Get the user's journey context from session."""
    session = load_session(repo_root)
    
    if not session:
        return "No session data available"
    
    parts = []
    
    if session.get("userName"):
        parts.append(f"User: {session['userName']}")
    
    if session.get("goal"):
        parts.append(f"Goal: {session['goal']}")
    
    if session.get("experienceLevel"):
        parts.append(f"Experience Level: {session['experienceLevel']}")
    
    if session.get("selectedFiles"):
        parts.append(f"\nFiles in journey: {', '.join(session['selectedFiles'])}")
    
    return "\n".join(parts)

