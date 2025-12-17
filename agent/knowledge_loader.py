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


def load_features(repo_root: str) -> List[Dict]:
    """Load system features from features.json."""
    features_path = Path(repo_root) / ".startblock" / "features.json"
    
    if not features_path.exists():
        print(f"[DEBUG] Features file not found: {features_path}")
        return []
    
    try:
        with open(features_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            features = data.get("features", [])
            print(f"[DEBUG] Loaded {len(features)} features")
            return features
    except Exception as e:
        print(f"Error loading features: {e}")
        return []


def load_onboarding_doc(repo_root: str, doc_name: str) -> Optional[str]:
    """Load an onboarding document (INDEX.md, SETUP.md, etc.)."""
    doc_path = Path(repo_root) / ".startblock" / "onboarding" / doc_name
    
    if not doc_path.exists():
        print(f"[DEBUG] Onboarding doc not found: {doc_path}")
        return None
    
    try:
        with open(doc_path, "r", encoding="utf-8") as f:
            content = f.read()
            # Strip frontmatter if present
            if content.startswith("---"):
                parts = content.split("---", 2)
                if len(parts) >= 3:
                    content = parts[2].strip()
            return content
    except Exception as e:
        print(f"Error loading onboarding doc {doc_name}: {e}")
        return None


def get_onboarding_context(repo_root: str) -> Dict[str, str]:
    """Load all onboarding docs into a dictionary."""
    docs = {}
    doc_names = ["INDEX.md", "SETUP.md", "ARCHITECTURE.md", "RESOURCES.md", "TASKS.md"]
    
    for doc_name in doc_names:
        content = load_onboarding_doc(repo_root, doc_name)
        if content:
            docs[doc_name] = content
    
    print(f"[DEBUG] Loaded {len(docs)} onboarding docs")
    return docs


def format_features_summary(features: List[Dict]) -> str:
    """Format features into a concise summary for the agent."""
    if not features:
        return "No features documented yet."
    
    summary_parts = []
    
    # Group by category
    by_category: Dict[str, List[Dict]] = {}
    for feature in features:
        category = feature.get("category", "Other")
        if category not in by_category:
            by_category[category] = []
        by_category[category].append(feature)
    
    for category, cat_features in by_category.items():
        summary_parts.append(f"\n### {category}")
        for f in cat_features:
            name = f.get("name", "Unknown")
            desc = f.get("description", "")
            user_flows = f.get("userFlows", [])
            files = f.get("files", [])
            
            summary_parts.append(f"- **{name}**")
            if desc:
                summary_parts.append(f"  {desc}")
            if user_flows:
                summary_parts.append(f"  User can: {', '.join(user_flows[:3])}")
            if files:
                summary_parts.append(f"  Files: {', '.join(files[:3])}")
    
    return "\n".join(summary_parts)


def get_feature_for_file(features: List[Dict], file_path: str) -> Optional[Dict]:
    """Find which feature a file belongs to."""
    for feature in features:
        files = feature.get("files", [])
        if file_path in files or any(file_path.endswith(f) for f in files):
            return feature
    return None


def format_feature_context(feature: Dict) -> str:
    """Format a feature into detailed context for the agent."""
    if not feature:
        return ""
    
    parts = [f"## Feature: {feature.get('name', 'Unknown')}"]
    
    if feature.get("description"):
        parts.append(f"\n{feature['description']}")
    
    if feature.get("userFlows"):
        parts.append("\n### What users can do:")
        for flow in feature["userFlows"]:
            parts.append(f"- {flow}")
    
    if feature.get("files"):
        parts.append("\n### Key files:")
        for f in feature["files"]:
            parts.append(f"- {f}")
    
    if feature.get("dependencies"):
        parts.append(f"\n### Depends on: {', '.join(feature['dependencies'])}")
    
    return "\n".join(parts)


def load_session(repo_root: str) -> Optional[Dict]:
    """Load the onboarding session data."""
    # Resolve to absolute path to handle relative paths like '..'
    repo_root = os.path.abspath(repo_root)
    sessions_dir = Path(repo_root) / ".startblock" / "sessions"
    
    print(f"[DEBUG] Looking for sessions in: {sessions_dir}")
    
    if not sessions_dir.exists():
        print(f"[DEBUG] Sessions directory does not exist: {sessions_dir}")
        return None
    
    # Find the most recent session file
    session_files = sorted(
        sessions_dir.glob("session-*.json"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )
    
    print(f"[DEBUG] Found {len(session_files)} session files")
    
    if not session_files:
        return None
    
    try:
        print(f"[DEBUG] Loading session from: {session_files[0]}")
        with open(session_files[0], "r") as f:
            session = json.load(f)
            print(f"[DEBUG] Session loaded. userName: {session.get('userName', 'NOT FOUND')}")
            return session
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
    sections = knowledge.get("sections", {})
    
    if sections.get("purpose"):
        context_parts.append(f"\n## Purpose\n{sections['purpose']}")
    
    if sections.get("gotchas"):
        context_parts.append(f"\n## Gotchas (Important!)\n{sections['gotchas']}")
    
    if sections.get("dependencies"):
        context_parts.append(f"\n## Dependencies\n{sections['dependencies']}")
    
    if sections.get("architecture"):
        context_parts.append(f"\n## Architecture\n{sections['architecture']}")
    
    if sections.get("insights"):
        context_parts.append(f"\n## Insights\n{sections['insights']}")
    
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

