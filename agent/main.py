"""
LiveKit Agent for Startblock Onboarding
Handles voice conversations with users during codebase onboarding.
"""

import asyncio
import os
import json
import uuid
from pathlib import Path
from typing import Dict, Optional, Any
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    WorkerOptions,
    cli,
    llm,
    UserInputTranscribedEvent,
)
from livekit.agents.voice import Agent as VoiceAgent, AgentSession
import livekit.plugins.openai as openai
import livekit.plugins.silero as silero
from knowledge_loader import (
    format_features_summary,
    get_feature_for_file,
)
from prompts import build_system_prompt, build_greeting_prompt, build_transition_prompt
from commands import NavigateCommand, ShowFileCommand, serialize_command


class ContextStore:
    """In-memory store for onboarding context received from local server."""
    
    def __init__(self):
        self.session = None
        self.features = []
        self.knowledge_files = {}  # path -> markdown
        self.current_file = None   # { path, content, knowledge, totalLines }
        self.features_summary = ""
        self.docs = {}
        self._context_ready = asyncio.Event()
        self._pending_requests = {} # requestId -> Future

    def update_context(self, data: Dict[str, Any]):
        """Update store with initial context payload."""
        if data.get("session"):
            self.session = data.get("session")
            print(f"[ContextStore] Received session. User: {self.session.get('userName')}")
            
        if data.get("features"):
            self.features = data.get("features", [])
            self.features_summary = format_features_summary(self.features)
            print(f"[ContextStore] Received features ({len(self.features)} items)")
        
        if data.get("knowledgeFiles"):
            self.knowledge_files.update(data.get("knowledgeFiles", {}))
            print(f"[ContextStore] Received knowledge files")
            
        if data.get("currentFile"):
            self.current_file = data.get("currentFile")
            print(f"[ContextStore] Received current file: {self.current_file.get('path')}")
        
        # Mark as ready ONLY if we have the critical trinity: Session, Features, and First File
        # This ensures the greeting is fully personalized.
        if self.session and self.features and self.current_file:
            if not self._context_ready.is_set():
                self._context_ready.set()
                print(f"[ContextStore] FULL CONTEXT READY. Firing ready event.")

    def update_file(self, data: Dict[str, Any]):
        """Update store with file content response."""
        request_id = data.get("requestId")
        if request_id in self._pending_requests:
            future = self._pending_requests.pop(request_id)
            if not future.done():
                future.set_result(data)
        else:
            # Also handle spontaneous file updates (like the initial file push)
            self.current_file = data
            print(f"[ContextStore] Initial file content received: {data.get('path')}")
            
            # If we were just waiting for this to be fully ready
            if self.session and self.features and not self._context_ready.is_set():
                self._context_ready.set()
                print(f"[ContextStore] FULL CONTEXT READY (via file update). Firing ready event.")

    async def wait_for_context(self, timeout: float = 10.0):
        """Wait for initial context push."""
        try:
            print(f"[ContextStore] Waiting for full context (Session+Features+File)...")
            await asyncio.wait_for(self._context_ready.wait(), timeout)
            return True
        except asyncio.TimeoutError:
            status = []
            if not self.session: status.append("Session")
            if not self.features: status.append("Features")
            if not self.current_file: status.append("FirstFile")
            print(f"[ContextStore] Timeout waiting for: {', '.join(status)}")
            
            # Fallback: if we at least have the session, we can proceed but it will be generic
            if self.session:
                print("[ContextStore] Proceeding with partial context (Session only)")
                return True
            return False


class OnboardingAgent(VoiceAgent):
    """Voice agent that guides users through codebase onboarding."""

    def __init__(self):
        self.room = None
        self.context = ContextStore()
        self.current_file_index = 0
        
        # Initialize STT, LLM, and TTS
        stt_model = openai.STT(model="whisper-1")
        llm_model = openai.LLM(model="gpt-4o-mini", temperature=0.7)
        tts_model = openai.TTS(voice="nova", model="tts-1")
        vad_model = silero.VAD.load()

        # Initialize the voice agent with empty instructions initially
        super().__init__(
            instructions="You are an onboarding assistant. Please wait a moment while I load the codebase context.",
            stt=stt_model,
            llm=llm_model,
            tts=tts_model,
            vad=vad_model,
            chat_ctx=llm.ChatContext(),
        )

    async def _request_file_from_server(self, file_path: str) -> Optional[Dict[str, Any]]:
        """Request file content from the local server via data channel."""
        if not self.room:
            return None
            
        request_id = str(uuid.uuid4())
        future = asyncio.get_event_loop().create_future()
        self.context._pending_requests[request_id] = future
        
        payload = json.dumps({
            "type": "request-file",
            "requestId": request_id,
            "path": file_path
        }).encode("utf-8")
        
        print(f"[Agent] Requesting file content: {file_path}")
        await self.room.local_participant.publish_data(
            payload=payload,
            reliable=True,
            topic="agent-commands"
        )
        
        try:
            # Wait for response with timeout
            return await asyncio.wait_for(future, timeout=3.0)
        except asyncio.TimeoutError:
            print(f"[Agent] Timeout requesting file: {file_path}")
            if request_id in self.context._pending_requests:
                del self.context._pending_requests[request_id]
            return None

    def _update_system_instructions(self):
        """Update LLM instructions using current context."""
        if not self.context.session:
            return

        selected_files = self.context.session.get("selectedFiles", [])
        current_file_path = (
            selected_files[self.current_file_index]
            if self.current_file_index < len(selected_files)
            else None
        )
        
        # Use current file context from store if it matches
        file_knowledge = None
        current_feature = None
        current_file_content = None
        
        if current_file_path:
            file_knowledge = self.context.knowledge_files.get(current_file_path)
            current_feature = get_feature_for_file(self.context.features, current_file_path)
            
            # If the current_file in context matches the one we want, use its data
            if self.context.current_file and self.context.current_file.get("path") == current_file_path:
                current_file_content = self.context.current_file.get("content")

        new_instructions = build_system_prompt(
            user_name=self.context.session.get("userName"),
            goal=self.context.session.get("goal"),
            experience_level=self.context.session.get("experienceLevel"),
            current_file=current_file_path,
            file_knowledge=file_knowledge,
            journey_files=selected_files,
            current_step=self.current_file_index + 1,
            total_steps=len(selected_files),
            features_summary=self.context.features_summary,
            current_feature=current_feature,
            current_file_content=current_file_content,
            architecture_doc=None, 
            setup_doc=None,
            tasks_doc=None,
        )
        
        self._instructions = new_instructions

    async def _advance_to_next_file(self):
        """Advance to the next file in the journey."""
        if not self.context.session:
            return
        
        selected_files = self.context.session.get("selectedFiles", [])
        total_files = len(selected_files)
        
        if self.current_file_index < total_files - 1:
            from_file = selected_files[self.current_file_index]
            self.current_file_index += 1
            to_file = selected_files[self.current_file_index]
            
            print(f"[Agent] Advancing from {from_file} to {to_file}")
            
            # Request full content for the new file
            file_data = await self._request_file_from_server(to_file)
            if file_data:
                self.context.current_file = file_data
            
            # Get feature context
            to_feature = get_feature_for_file(self.context.features, to_file)
            
            # Update UI
            await self._show_file_in_ui(
                file=to_file,
                title=to_file.split("/")[-1],
                explanation=f"Now let's look at {to_file}. This connects to what we just learned.",
                start_line=1,
                end_line=50,
            )
            
            # Update LLM instructions for the new file
            self._update_system_instructions()
            
            # Generate transition message
            user_name = self.context.session.get("userName")
            transition_prompt = build_transition_prompt(
                user_name=user_name,
                from_file=from_file,
                to_file=to_file,
                to_feature=to_feature,
            )
            
            await self.session.generate_reply(instructions=transition_prompt)
        else:
            # Reached end
            user_name = self.context.session.get("userName", "you")
            completion_prompt = f"Celebrate {user_name} completing the journey! Recp what they learned and encourage them."
            await self.session.generate_reply(instructions=completion_prompt)
    
    async def _send_ui_command(self, command):
        """Send a UI command via data channel."""
        try:
            if not self.room: return
            data = serialize_command(command)
            await self.room.local_participant.publish_data(
                payload=data, reliable=True, topic="agent-commands",
            )
        except Exception as e:
            print(f"[Agent] Error sending UI command: {e}")

    async def _show_file_in_ui(self, file: str, title: str, explanation: str, start_line: int = None, end_line: int = None):
        feature = get_feature_for_file(self.context.features, file)
        feature_name = feature.get("name") if feature else None
        
        command = ShowFileCommand(
            file=file, title=title, explanation=explanation,
            startLine=start_line, endLine=end_line, featureName=feature_name,
        )
        await self._send_ui_command(command)

    async def greet_user(self):
        """Generate the initial greeting once context is ready."""
        print("[Agent] Generating greeting...")
        self._update_system_instructions()
        
        user_name = self.context.session.get('userName', 'there')
        goal = self.context.session.get('goal', 'explore the codebase')
        experience_level = self.context.session.get('experienceLevel', 'intermediate')
        
        first_file = None
        first_file_knowledge = None
        if self.context.current_file:
            first_file = self.context.current_file.get('path')
            first_file_knowledge = self.context.current_file.get('knowledge')
            
            # Show first file in UI
            await self._show_file_in_ui(
                file=first_file,
                title=first_file.split("/")[-1],
                explanation=f"Let's start by exploring {first_file}.",
                start_line=1, end_line=50,
            )
        
        greeting_prompt = build_greeting_prompt(
            user_name=user_name,
            goal=goal,
            experience_level=experience_level,
            features=self.context.features,
            first_file=first_file,
            first_file_knowledge=first_file_knowledge,
        )
        
        await self.session.generate_reply(instructions=greeting_prompt)


async def entrypoint(ctx: JobContext):
    # Connect with AUDIO_ONLY to reduce overhead, but we need data channels
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    
    # Identify ourselves
    me = ctx.room.local_participant
    print(f"[Agent] CONNECTED | Room: {ctx.room.name}")
    print(f"[Agent] MY IDENTITY: {me.identity}")
    print(f"[Agent] CURRENT REMOTE PARTICIPANTS: {[p.identity for p in ctx.room.remote_participants.values()]}")

    agent = OnboardingAgent()
    agent.room = ctx.room
    
    # Listen for context messages from local server
    @ctx.room.on("data_received")
    def on_data(packet: Any):
        # The SDK version on Railway passes a single DataPacket object
        payload = packet.data
        topic = packet.topic
        participant = packet.participant
        
        p_identity = participant.identity if participant else 'unknown'
        print(f"[Agent] DATA RECEIVED | Topic: {topic} | From: {p_identity} | Size: {len(payload)} bytes")
        
        try:
            decoded = payload.decode("utf-8")
            data = json.loads(decoded)
            print(f"[Agent] DATA TYPE: {data.get('type')}")
            
            if topic == "server-context":
                if data.get("type") == "onboarding-context":
                    print(f"[Agent] SUCCESS: Received onboarding context from {p_identity}")
                    agent.context.update_context(data)
                elif data.get("type") == "file-content":
                    print(f"[Agent] SUCCESS: Received file content for {data.get('path')}")
                    agent.context.update_file(data)
            else:
                # Debug: check if context was sent on wrong topic
                if data.get("type") == "onboarding-context":
                    print(f"[Agent] WARNING: Received context on WRONG topic: {topic}")
                    agent.context.update_context(data)
        except Exception as e:
            print(f"[Agent] PARSE ERROR: {e}")

    # Wait for context
    print("Starting onboarding agent (Context-Push mode)...")
    print(f"[Agent] WAITING for context push (25s timeout)...")
    
    context_received = await agent.context.wait_for_context(timeout=25.0)
    
    if not context_received:
        print("[Agent] CRITICAL TIMEOUT: No context received.")
        print(f"[Agent] FINAL ROOM MEMBERS: {[p.identity for p in ctx.room.remote_participants.values()]}")
        print("[Agent] Falling back to generic mode.")

    # Start the agent session
    print("[Agent] Starting session...")
    session = AgentSession()
    
    # Listen for transcription for navigation
    @session.on("user_input_transcribed")
    def on_user_input(event: UserInputTranscribedEvent):
        if not event.is_final: return
        user_text = event.transcript.strip()
        word_count = len(user_text.split())
        
        if word_count >= 15: return
        
        if word_count <= 3:
            quick_nav = ["next", "got it", "okay", "continue", "proceed"]
            if any(nav in user_text.lower() for nav in quick_nav):
                asyncio.create_task(agent._advance_to_next_file())
            return
        
        asyncio.create_task(classify_and_handle_intent(agent, user_text))

    await session.start(agent=agent, room=ctx.room)

    # Greet once started if we have context
    if agent.context.session:
        await agent.greet_user()

    # Wait for the room to disconnect to keep the worker task alive
    disconnect_event = asyncio.Event()
    @ctx.room.on("disconnected")
    def on_disconnect():
        disconnect_event.set()
        
    await disconnect_event.wait()
    print("[Agent] Room disconnected, shutting down.")


async def classify_and_handle_intent(agent, user_text: str):
    """Classify user intent for navigation."""
    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI()
        
        current_file = agent.context.current_file.get("path") if agent.context.current_file else "unknown"
        
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{
                "role": "system",
                "content": "Classify intent as NAVIGATE, QUESTION, or OTHER. User is in codebase onboarding."
            }, {
                "role": "user", 
                "content": f"File: {current_file}\nUser: \"{user_text}\"\nIntent:"
            }],
            max_tokens=10, temperature=0
        )
        
        intent = response.choices[0].message.content.strip().upper()
        if intent == "NAVIGATE":
            await agent._advance_to_next_file()
    except Exception as e:
        print(f"[Agent] Intent error: {e}")


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
