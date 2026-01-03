---
filePath: ui/src/hooks/useVoiceChat.ts
fileVersion: unknown
lastUpdated: '2026-01-03T02:24:27.877Z'
updatedBy: sb-cli
tags:
  - ui
  - src
  - hooks
  - typescript
  - new
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
feature: voice-chat
featureRole: helper
userFlows:
  - User can send and receive voice messages in real-time
  - User can view transcriptions of voice messages
relatedFiles:
  - '@livekit/components-react'
  - livekit-client
  - '@/components/VoiceTranscript'
---
## Purpose
This file provides a custom React hook, `useVoiceChat`, that manages voice chat messages in a LiveKit room, including handling transcription events.

## Key Functionality
- `useVoiceChat`: A hook that initializes a welcome message and listens for transcription events to update the message list.

## Gotchas
- The initial welcome message is hardcoded and may need to be updated for different contexts or users.
- The transcription handling logic assumes that the 'final' property indicates a completed message, which may not always align with how transcription services operate, especially in noisy environments.
- The message deduplication logic only checks for existing message IDs, which could lead to missed updates if the same message is sent multiple times with different content.
- The use of `Date.now()` for timestamps means messages may not be accurately ordered if multiple messages are received in quick succession; consider using the timestamp provided by the transcription service if available.
- The component relies on the `useRoomContext` hook, which means it must be used within a context provider, making it less flexible if used outside of the intended context.

## Dependencies
- `useRoomContext`: This hook is essential for accessing the LiveKit room context, which provides the necessary functionality to handle real-time transcription events.
- `RoomEvent`: This is used to listen for transcription events from the LiveKit service, allowing the hook to respond to incoming transcription data.

## Architecture Context
This hook is part of a larger voice chat feature that integrates with LiveKit, enabling real-time communication and transcription capabilities within the application. It is designed to be used in components that require voice interaction.

## Implementation Notes
- The hook sets up an effect to listen for transcription events when the room context is available, ensuring that it cleans up the event listener when the component unmounts.
- The design choice to use a state array for messages allows for dynamic updates as new transcriptions are received, but care must be taken to manage performance and avoid unnecessary re-renders.
