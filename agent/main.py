"""
LiveKit Agent for Startblock Onboarding
Handles voice conversations with users during codebase onboarding.
"""

import asyncio
import os
import json
from pathlib import Path
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    WorkerOptions,
    cli,
    llm,
    UserInputTranscribedEvent,
)
from livekit.agents.voice import Agent as VoiceAgent, AgentSession
from livekit.plugins import openai
import livekit.plugins.silero as silero
from knowledge_loader import (
    load_session,
    load_features,
    get_onboarding_context,
    get_context_for_file,
    format_features_summary,
    get_feature_for_file,
)
from prompts import build_system_prompt, build_greeting_prompt, build_transition_prompt
from commands import NavigateCommand, ShowFileCommand, serialize_command


def get_repo_root_from_room(room) -> str:
    """Extract repo root from room metadata, fall back to env var."""
    try:
        if room and room.metadata:
            metadata = json.loads(room.metadata)
            repo_root = metadata.get("repoRoot")
            if repo_root:
                print(f"[DEBUG] Got repoRoot from room metadata: {repo_root}")
                return os.path.abspath(repo_root)
    except Exception as e:
        print(f"[DEBUG] Could not parse room metadata: {e}")
    
    # Fall back to environment variable
    fallback = os.getenv("REPO_ROOT", os.getcwd())
    print(f"[DEBUG] Using fallback repoRoot: {fallback}")
    return os.path.abspath(fallback)


class OnboardingAgent(VoiceAgent):
    """Voice agent that guides users through codebase onboarding."""

    def __init__(self, *, repo_root: str):
        self.room = None
        self.repo_root = repo_root
        self.onboarding_session = load_session(repo_root)
        self.current_file_index = 0
        
        # Load all available context
        self.features = load_features(repo_root)
        self.onboarding_docs = get_onboarding_context(repo_root)
        self.features_summary = format_features_summary(self.features)
        
        print(f"[DEBUG] Loaded context: {len(self.features)} features, {len(self.onboarding_docs)} docs")
        
        # Build system prompt with full context
        system_prompt = self._build_system_prompt()
        
        # Initialize STT, LLM, and TTS
        stt_model = openai.STT(
            model="whisper-1",
        )

        llm_model = openai.LLM(
            model="gpt-4o-mini",
            temperature=0.7,
        )

        tts_model = openai.TTS(
            voice="nova",
            model="tts-1",
        )

        vad_model = silero.VAD.load()

        # Initialize the voice agent
        super().__init__(
            instructions=system_prompt,
            stt=stt_model,
            llm=llm_model,
            tts=tts_model,
            vad=vad_model,
            chat_ctx=llm.ChatContext(),
        )

    def _build_system_prompt(self) -> str:
        """Build the system prompt with full context."""
        if not self.onboarding_session:
            # Fallback with features context only
            return build_system_prompt(
                user_name=None,
                goal=None,
                experience_level="intermediate",
                current_file=None,
                file_knowledge=None,
                journey_files=[],
                features_summary=self.features_summary,
                architecture_doc=self.onboarding_docs.get("ARCHITECTURE.md"),
            )
        
        selected_files = self.onboarding_session.get("selectedFiles", [])
        current_file = (
            selected_files[self.current_file_index]
            if self.current_file_index < len(selected_files)
            else None
        )
        
        # Get file-specific knowledge
        file_knowledge = None
        current_feature = None
        if current_file:
            file_knowledge = get_context_for_file(self.repo_root, current_file)
            current_feature = get_feature_for_file(self.features, current_file)
        
        return build_system_prompt(
            user_name=self.onboarding_session.get("userName"),
            goal=self.onboarding_session.get("goal"),
            experience_level=self.onboarding_session.get("experienceLevel"),
            current_file=current_file,
            file_knowledge=file_knowledge,
            journey_files=selected_files,
            current_step=self.current_file_index + 1,
            total_steps=len(selected_files),
            features_summary=self.features_summary,
            current_feature=current_feature,
            architecture_doc=self.onboarding_docs.get("ARCHITECTURE.md"),
            setup_doc=self.onboarding_docs.get("SETUP.md"),
            tasks_doc=self.onboarding_docs.get("TASKS.md"),
        )

    async def _advance_to_next_file(self):
        """Advance to the next file in the journey."""
        if not self.onboarding_session:
            print("[DEBUG] No onboarding session, cannot advance")
            return
        
        selected_files = self.onboarding_session.get("selectedFiles", [])
        total_files = len(selected_files)
        
        if self.current_file_index < total_files - 1:
            from_file = selected_files[self.current_file_index]
            self.current_file_index += 1
            to_file = selected_files[self.current_file_index]
            
            print(f"[DEBUG] Advancing from {from_file} to {to_file}")
            
            # Get feature context for the new file
            to_feature = get_feature_for_file(self.features, to_file)
            
            # Show the new file in UI with context
            await self._show_file_in_ui(
                file=to_file,
                title=to_file.split("/")[-1],
                explanation=f"Now let's look at {to_file}. This connects to what we just learned.",
                start_line=1,
                end_line=50,
            )
            
            # Generate transition message
            user_name = self.onboarding_session.get("userName")
            transition_prompt = build_transition_prompt(
                user_name=user_name,
                from_file=from_file,
                to_file=to_file,
                to_feature=to_feature,
            )
            
            print(f"[DEBUG] Advancing to file {self.current_file_index + 1}/{total_files}: {to_file}")
            await self.session.generate_reply(instructions=transition_prompt)
        else:
            # Reached end of journey
            print(f"[DEBUG] Completed all {total_files} files!")
            user_name = self.onboarding_session.get("userName", "you")
            completion_prompt = f"""Congratulate {user_name} on completing the onboarding journey!

They've explored all {total_files} key files. Summarize what they learned:
1. Brief recap of the files covered
2. Encourage them to start coding
3. Remind them they can ask questions anytime

Keep it celebratory but brief (2-3 sentences)."""
            await self.session.generate_reply(instructions=completion_prompt)
    
    async def _send_ui_command(self, command):
        """Send a UI command to the frontend via data channel."""
        try:
            if not self.room:
                print("[DEBUG] No room available, cannot send command")
                return
            data = serialize_command(command)
            await self.room.local_participant.publish_data(
                payload=data,
                reliable=True,
                topic="agent-commands",  # Must match UI's useDataChannel topic
            )
            print(f"[DEBUG] Published command to 'agent-commands' topic")
        except Exception as e:
            print(f"[DEBUG] Error sending UI command: {e}")
            import traceback
            traceback.print_exc()

    async def _show_file_in_ui(self, file: str, title: str, explanation: str, start_line: int = None, end_line: int = None):
        """Send ShowFileCommand to display file with knowledge in UI."""
        feature = get_feature_for_file(self.features, file)
        feature_name = feature.get("name") if feature else None
        
        command = ShowFileCommand(
            file=file,
            title=title,
            explanation=explanation,
            startLine=start_line,
            endLine=end_line,
            featureName=feature_name,
        )
        await self._send_ui_command(command)
        print(f"[DEBUG] Sent ShowFileCommand for {file}")

    async def on_enter(self):
        """Called when agent enters the room."""
        print("Agent entered room")
        print("Generating personalized greeting...")
        
        # Build personalized greeting with actual session data
        user_name = "there"
        goal = "explore the codebase"
        experience_level = "intermediate"
        first_file = None
        first_file_knowledge = None
        
        if self.onboarding_session:
            user_name = self.onboarding_session.get('userName', 'there')
            goal = self.onboarding_session.get('goal', 'explore the codebase')
            experience_level = self.onboarding_session.get('experienceLevel', 'intermediate')
            selected_files = self.onboarding_session.get('selectedFiles', [])
            if selected_files:
                first_file = selected_files[0]
                first_file_knowledge = get_context_for_file(self.repo_root, first_file)
                print(f"[DEBUG] First file: {first_file}")
                print(f"[DEBUG] Knowledge found: {bool(first_file_knowledge and 'No knowledge' not in first_file_knowledge)}")
                
                # Show the first file in the UI immediately
                await self._show_file_in_ui(
                    file=first_file,
                    title=first_file.split("/")[-1],  # Just the filename
                    explanation=f"Let's start by exploring {first_file}. This is the first file in your learning journey.",
                    start_line=1,
                    end_line=50,  # Show first 50 lines initially
                )
        
        greeting_prompt = build_greeting_prompt(
            user_name=user_name,
            goal=goal,
            experience_level=experience_level,
            features=self.features,
            first_file=first_file,
            first_file_knowledge=first_file_knowledge,
        )
        
        print(f"[DEBUG] User: {user_name}, Goal: {goal}")
        print(f"[DEBUG] First file to discuss: {first_file}")
        print("[DEBUG] Calling generate_reply for greeting...")
        try:
            await self.session.generate_reply(instructions=greeting_prompt)
            print("[DEBUG] generate_reply completed")
        except Exception as e:
            print(f"[ERROR] generate_reply failed: {e}")
            import traceback
            traceback.print_exc()


async def entrypoint(ctx: JobContext):
    """Entry point for the agent job."""
    print("Starting onboarding agent...")

    # Wait for room to be ready
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    
    # Get repo root from room metadata (set by server when creating token)
    repo_root = get_repo_root_from_room(ctx.room)
    print(f"Repo root (resolved): {repo_root}")

    # Create the agent with the correct repo root
    agent = OnboardingAgent(repo_root=repo_root)
    agent.room = ctx.room
    
    # Start the agent session
    session = AgentSession()
    
    # Register event handler for user speech
    @session.on("user_input_transcribed")
    def on_user_input(event: UserInputTranscribedEvent):
        """Handle user speech input and check for navigation intent."""
        # Only process final transcriptions to avoid partial duplicates
        if not event.is_final:
            return
            
        user_text = event.transcript.strip()
        print(f"[DEBUG] User said: '{user_text}'")
        
        # Smart filtering to avoid unnecessary LLM calls
        word_count = len(user_text.split())
        user_lower = user_text.lower()
        
        # Long messages (15+ words) are almost always questions/discussions - skip classification
        if word_count >= 15:
            print(f"[DEBUG] Long message - assuming discussion, no classification needed")
            return
        
        # Very short messages (1-3 words) - use fast keyword matching
        if word_count <= 3:
            quick_nav = ["next", "got it", "okay", "continue", "proceed", "understood", "makes sense"]
            if any(nav in user_lower for nav in quick_nav):
                print(f"[DEBUG] Short nav phrase detected - advancing")
                asyncio.create_task(agent._advance_to_next_file())
            return
        
        # Medium messages (4-14 words) - these are ambiguous, use LLM
        asyncio.create_task(classify_and_handle_intent(agent, user_text))
    
    # Start the session (this calls agent.on_enter)
    print("[DEBUG] Starting agent session...")
    await session.start(agent=agent, room=ctx.room)

    # Keep agent alive
    await asyncio.sleep(1)


async def classify_and_handle_intent(agent, user_text: str):
    """Use LLM to classify user intent and handle navigation."""
    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI()
        
        current_file = "unknown"
        if agent.onboarding_session:
            selected_files = agent.onboarding_session.get("selectedFiles", [])
            if selected_files and agent.current_file_index < len(selected_files):
                current_file = selected_files[agent.current_file_index]
        
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{
                "role": "system",
                "content": """Classify the user's intent in an onboarding conversation. They are currently learning about a code file.

Respond with EXACTLY one word:
- NAVIGATE - if user wants to move to the next file/topic (e.g., "next", "got it let's move on", "I understand, what's next?")
- QUESTION - if user is asking about the current file or wants more explanation (e.g., "can you explain more?", "how does this work?", "let's go deeper into this")
- OTHER - anything else (greetings, off-topic, etc.)

Important: If the user says something like "let's go" but follows with a question, that's QUESTION not NAVIGATE."""
            }, {
                "role": "user", 
                "content": f"Current file: {current_file}\nUser said: \"{user_text}\"\n\nIntent:"
            }],
            max_tokens=10,
            temperature=0
        )
        
        intent = response.choices[0].message.content.strip().upper()
        print(f"[DEBUG] Classified intent: {intent}")
        
        if intent == "NAVIGATE":
            print(f"[DEBUG] User wants to navigate - advancing to next file...")
            await agent._advance_to_next_file()
        else:
            print(f"[DEBUG] User intent is {intent} - letting agent respond naturally")
            
    except Exception as e:
        print(f"[DEBUG] Intent classification error: {e}")


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
        )
    )
