"""
LiveKit Agent for Startblock Onboarding
Handles voice conversations with users during codebase onboarding.
"""

import asyncio
import os
from pathlib import Path
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    WorkerOptions,
    cli,
    llm,
    tts,
    stt,
    vad,
)
from livekit.agents.voice import Agent as VoiceAgent, AgentSession
from livekit import rtc
from livekit.plugins import openai
import livekit.plugins.silero as silero
from knowledge_loader import (
    load_session,
    get_context_for_file,
    get_journey_context,
)
from prompts import build_system_prompt
from commands import NavigateCommand, serialize_command


class OnboardingAgent(VoiceAgent):
    """Voice agent that guides users through codebase onboarding."""

    def __init__(self, *, repo_root: str):
        self.room = None
        self.repo_root = repo_root
        self.onboarding_session = load_session(repo_root)
        self.current_file_index = 0
        
        # Build system prompt with context
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

        # Initialize the voice agent with instructions
        super().__init__(
            instructions=system_prompt,
            stt=stt_model,
            llm=llm_model,
            tts=tts_model,
            vad=vad_model,
            chat_ctx=llm.ChatContext(),
        )

    def _build_system_prompt(self) -> str:
        """Build the system prompt with current context."""
        if not self.onboarding_session:
            return "You are an expert senior developer helping someone understand a codebase. Be warm, encouraging, and patient."
        
        selected_files = self.onboarding_session.get("selectedFiles", [])
        current_file = (
            selected_files[self.current_file_index]
            if self.current_file_index < len(selected_files)
            else None
        )
        
        file_knowledge = None
        if current_file:
            file_knowledge = get_context_for_file(self.repo_root, current_file)
        
        return build_system_prompt(
            user_name=self.onboarding_session.get("userName"),
            goal=self.onboarding_session.get("goal"),
            experience_level=self.onboarding_session.get("experienceLevel"),
            current_file=current_file,
            file_knowledge=file_knowledge,
            journey_files=selected_files,
            current_step=self.current_file_index + 1,
            total_steps=len(selected_files),
        )

    def _update_system_prompt(self):
        """Update the system prompt with current context."""
        # Update instructions
        new_prompt = self._build_system_prompt()
        self.instructions = new_prompt
        if self.chat_ctx:
            self.chat_ctx.system_message = new_prompt

    async def on_user_turn_completed(self, turn_ctx: llm.ChatContext, new_message: llm.ChatMessage):
        """Called when user finishes speaking."""
        # Get the last user message content
        if new_message and new_message.role == "user":
            user_text = new_message.content
            if isinstance(user_text, str):
                user_text = user_text.strip()
                print(f"User said: {user_text}")
                
                # Check for navigation intent
                user_lower = user_text.lower()
                if any(phrase in user_lower for phrase in ["next", "got it", "makes sense", "i understand", "continue"]):
                    await self._advance_to_next_file()

    async def _advance_to_next_file(self):
        """Advance to the next file in the journey."""
        if not self.onboarding_session:
            return
        
        selected_files = self.onboarding_session.get("selectedFiles", [])
        if self.current_file_index < len(selected_files) - 1:
            self.current_file_index += 1
            self._update_system_prompt()
            
            # Send UI command to frontend
            next_file = selected_files[self.current_file_index]
            command = NavigateCommand(to=next_file)
            await self._send_ui_command(command)
            
            print(f"Advanced to file {self.current_file_index + 1}/{len(selected_files)}")
    
    async def _send_ui_command(self, command):
        """Send a UI command to the frontend via data channel."""
        try:
            if not self.room:
                return
            data = serialize_command(command)
            await self.room.local_participant.publish_data(
                data,
                reliable=True,
            )
        except Exception as e:
            print(f"Error sending UI command: {e}")

    async def on_enter(self):
        """Called when agent enters the room."""
        print("Agent entered room")
        print("Agent ready. Waiting for user to speak...")
        
        # Room is already available as self.room in VoiceAgent if needed, 
        # but we are managing it via AgentSession in entrypoint.
        # For this simple implementation, we can just use self.room if it's set.
        
        # Greet the user
        if self.onboarding_session:
             greeting = f"Hi {self.onboarding_session.get('userName', 'there')}. I'm your onboarding guide. " \
                        f"We're currently looking at {self.onboarding_session.get('current_file') or 'the project root'}. " \
                        f"I can walk you through the codebase. Shall we start?"
             
             # Use the session to say the greeting
             if self.session:
                 print(f"Saying greeting: {greeting}")
                 await self.session.say(greeting)


async def entrypoint(ctx: JobContext):
    """Entry point for the agent job."""
    print("Starting onboarding agent...")
    
    # Get repo root from environment or use current directory
    repo_root = os.getenv("REPO_ROOT", os.getcwd())
    print(f"Repo root: {repo_root}")

    # Wait for room to be ready
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # Create the agent
    agent = OnboardingAgent(repo_root=repo_root)
    agent.room = ctx.room # Manually set the room since we need it for UI commands
    
    # Start the agent session
    session = AgentSession()
    await session.start(agent=agent, room=ctx.room)

    # Keep agent alive
    await asyncio.sleep(1)


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
        )
    )
