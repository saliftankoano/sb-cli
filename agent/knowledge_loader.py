"""
Utilities for formatting knowledge context.
"""

from typing import Dict, List, Optional


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

