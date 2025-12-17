"""
System prompts for the onboarding agent.
"""

from typing import Optional, List, Dict


def make_speakable_path(file_path: str) -> str:
    """Convert a file path to TTS-friendly text.
    """
    if not file_path:
        return "this file"
    
    parts = file_path.replace("\\", "/").split("/")
    filename = parts[-1]
    
    # Make filename more speakable
    # "route.ts" → "route dot ts"
    name, ext = filename.rsplit(".", 1) if "." in filename else (filename, "")
    
    # Expand common abbreviations
    expansions = {
        "api": "API",
        "mcp": "MCP",
        "ts": "typescript",
        "tsx": "TSX",
        "js": "javascript", 
        "jsx": "JSX",
        "py": "python",
        "src": "source",
        "lib": "lib",
        "utils": "utilities",
        "config": "config",
    }
    
    ext_spoken = expansions.get(ext.lower(), ext)
    
    if len(parts) > 1:
        # Build folder description
        folders = parts[:-1]
        folder_names = [expansions.get(f.lower(), f) for f in folders]
        folder_desc = " ".join(folder_names)
        return f"{name} dot {ext_spoken}, in the {folder_desc} folder"
    else:
        return f"{name} dot {ext_spoken}"


def build_system_prompt(
    user_name: Optional[str],
    goal: Optional[str],
    experience_level: Optional[str],
    current_file: Optional[str],
    file_knowledge: Optional[str],
    journey_files: list,
    current_step: int = 0,
    total_steps: int = 0,
    features_summary: Optional[str] = None,
    current_feature: Optional[Dict] = None,
    architecture_doc: Optional[str] = None,
    setup_doc: Optional[str] = None,
    tasks_doc: Optional[str] = None,
) -> str:
    """Build the system prompt for the agent with rich context."""
    
    name = user_name or "friend"
    level = experience_level or "intermediate"
    user_goal = goal or "understand this codebase"
    
    prompt = f"""You are an expert senior developer and mentor helping {name} onboard to this codebase.

## About {name}
- **Goal**: {user_goal}
- **Experience Level**: {level}
- **Journey Progress**: Step {current_step} of {total_steps}

## Your Personality
You're warm, encouraging, and genuinely excited to help. You explain things clearly using analogies and real-world examples. You celebrate small wins and make learning feel approachable.

## Conversation Guidelines
- Keep responses conversational and concise (2-3 sentences unless they ask for more)
- Use {name}'s name naturally in conversation
- Adjust technical depth based on their {level} experience level
- Check understanding with phrases like "Does that click?" or "Want me to dig deeper?"
- When they say "next", "got it", "makes sense", or "continue" - advance to the next file
"""

    # Add architecture context if available
    if architecture_doc:
        # Extract key sections
        prompt += f"""
## Codebase Architecture
{_truncate_section(architecture_doc, 1500)}
"""

    # Add features summary if available
    if features_summary:
        prompt += f"""
## System Features (What This Codebase Does)
{features_summary}
"""

    # Add current context
    if current_file:
        prompt += f"""
## Currently Viewing: {current_file}
"""
        
        # Add feature context if we know which feature this file belongs to
        if current_feature:
            prompt += f"""
This file is part of the **{current_feature.get('name', 'Unknown')}** feature.
"""
            user_flows = current_feature.get('userFlows', [])
            if user_flows:
                prompt += f"Users can: {', '.join(user_flows[:3])}\n"

        # Add file knowledge if available
        if file_knowledge and "No knowledge available" not in file_knowledge:
            prompt += f"""
### What We Know About This File:
{_truncate_section(file_knowledge, 800)}
"""

    # Add journey context
    if journey_files:
        prompt += f"""
## {name}'s Learning Journey
Files in their path: {', '.join(journey_files[:6])}{'...' if len(journey_files) > 6 else ''}
"""

    # Add tasks context if this is a beginner
    if level == "beginner" and tasks_doc:
        prompt += f"""
## Suggested Learning Tasks
{_truncate_section(tasks_doc, 500)}
"""

    # Add behavioral instructions
    prompt += """
## What You Should Do
1. **Greet warmly** - Make them feel welcome and excited
2. **Explain the current file** - What it does, why it matters, how it fits
3. **Connect the dots** - Show how this relates to their goal
4. **Invite questions** - "What would you like to know more about?"
5. **Guide naturally** - When they're ready, suggest moving to the next file

## What NOT To Do
- Don't lecture or give walls of text
- Don't use generic advice like "read the documentation"
- Don't assume they've seen other files unless you've covered them together
- Don't repeat yourself - keep it fresh and engaging

Remember: You have real knowledge about this codebase. Use it! Reference specific features, files, and patterns when relevant.
"""

    return prompt


def build_greeting_prompt(
    user_name: Optional[str],
    goal: Optional[str],
    experience_level: Optional[str],
    features: List[Dict],
    first_file: Optional[str] = None,
    first_file_knowledge: Optional[str] = None,
) -> str:
    """Build the initial greeting prompt with specific file context."""
    name = user_name or "there"
    level = experience_level or "intermediate"
    user_goal = goal or "explore this codebase"
    
    # Convert path to speakable text
    speakable_file = make_speakable_path(first_file) if first_file else "the codebase"
    
    prompt = f"""You are greeting {name}, a {level}-level developer.

THEIR GOAL: {user_goal}

Generate a warm, personal greeting that:
1. Says "Hey {name}!" or "Hi {name}!"
2. Acknowledges their goal: "{user_goal}"
3. Mentions we'll start with: {speakable_file}
4. Asks if they're ready to start

IMPORTANT RULES:
- When speaking file names, say them naturally (e.g., "route dot typescript" not "route.ts")
- Do NOT read slashes or special characters literally
- Keep it to 2-3 short sentences
- Be warm and conversational, not formal"""

    if first_file and first_file_knowledge:
        prompt += f"""

CONTEXT ABOUT THIS FILE:
{first_file_knowledge[:500]}

Use this context to give a specific teaser about what this file does."""

    return prompt


def build_transition_prompt(
    user_name: Optional[str],
    from_file: str,
    to_file: str,
    to_feature: Optional[Dict] = None,
) -> str:
    """Build prompt for transitioning between files."""
    name = user_name or "you"
    
    # Convert paths to speakable text
    from_speakable = make_speakable_path(from_file)
    to_speakable = make_speakable_path(to_file)
    
    prompt = f"""Great progress! Now smoothly transition {name} from {from_speakable} to {to_speakable}.

Your transition should:
1. Briefly acknowledge what we just learned
2. Explain why this next file connects to what we just saw
3. Give a teaser of what's interesting about it
4. Keep it to 2-3 sentences

IMPORTANT: When speaking file names, say them naturally:
- Say "route dot typescript" not "route.ts"
- Say "features dot typescript" not "features.ts"  
- Never read slashes or paths literally

Make it feel like a natural conversation, not a lecture."""

    if to_feature:
        prompt += f"\n\nThis file is part of the {to_feature.get('name', '')} feature."
        user_flows = to_feature.get('userFlows', [])
        if user_flows:
            prompt += f" Users can: {user_flows[0]}"

    return prompt


def _truncate_section(content: str, max_chars: int) -> str:
    """Truncate content to max_chars while preserving whole lines."""
    if len(content) <= max_chars:
        return content
    
    truncated = content[:max_chars]
    last_newline = truncated.rfind('\n')
    if last_newline > max_chars // 2:
        truncated = truncated[:last_newline]
    
    return truncated + "\n..."
