import { Router } from "express";
import { AccessToken, RoomServiceClient, Room } from "livekit-server-sdk";
import { buildOnboardingContext, getFileWithKnowledge } from "./context-provider.js";

interface LiveKitTokenRequest {
  sessionId?: string;
}

// Keep track of active server participants to send context
const activeRooms = new Map<string, Room>();

export function setupLiveKitRoutes(
  repoRoot: string,
  config?: { url?: string; apiKey?: string; apiSecret?: string }
): Router {
  const router = Router();

  const livekitUrl = process.env.LIVEKIT_URL || config?.url;
  const livekitApiKey = process.env.LIVEKIT_API_KEY || config?.apiKey;
  const livekitApiSecret = process.env.LIVEKIT_API_SECRET || config?.apiSecret;

  /**
   * Connect server to room as context provider
   */
  async function connectServerToRoom(roomName: string) {
    if (activeRooms.has(roomName)) return;

    if (!livekitUrl || !livekitApiKey || !livekitApiSecret) return;

    const room = new Room({
      url: livekitUrl,
      token: await new AccessToken(livekitApiKey, livekitApiSecret, {
        identity: "local-server",
        name: "Context Provider",
      })
        .addGrant({
          room: roomName,
          roomJoin: true,
          canPublish: true,
          canSubscribe: true,
          canPublishData: true,
        })
        .toJwt(),
    });

    try {
      await room.connect();
      activeRooms.set(roomName, room);
      console.log(`[LiveKit] Server connected to room: ${roomName}`);

      room.on("participantConnected", async (participant) => {
        // When agent joins, send initial context
        // We assume any participant with 'agent' in identity is our target
        if (participant.identity.toLowerCase().includes("agent")) {
          console.log(`[LiveKit] Agent detected: ${participant.identity}. Sending context...`);
          const context = await buildOnboardingContext(repoRoot);
          if (context) {
            await room.localParticipant.publishData(
              Buffer.from(JSON.stringify(context)),
              {
                reliable: true,
                destinationIdentities: [participant.identity],
                topic: "server-context",
              }
            );
            console.log(`[LiveKit] Sent initial context to agent`);
          }
        }
      });

      room.on("dataReceived", async (payload, participant) => {
        try {
          const text = new TextDecoder().decode(payload);
          const msg = JSON.parse(text);

          if (msg.type === "request-file") {
            console.log(`[LiveKit] Agent requested file: ${msg.path}`);
            const fileContext = await getFileWithKnowledge(repoRoot, msg.path);
            if (fileContext) {
              const response = {
                type: "file-content",
                requestId: msg.requestId,
                ...fileContext,
              };
              await room.localParticipant.publishData(
                Buffer.from(JSON.stringify(response)),
                {
                  reliable: true,
                  destinationIdentities: [participant?.identity || ""],
                  topic: "server-context",
                }
              );
              console.log(`[LiveKit] Sent file content for ${msg.path}`);
            }
          }
        } catch (e) {
          console.error("[LiveKit] Error handling data message:", e);
        }
      });

      room.on("disconnected", () => {
        activeRooms.delete(roomName);
        console.log(`[LiveKit] Server disconnected from room: ${roomName}`);
      });
    } catch (error) {
      console.error(`[LiveKit] Failed to connect server to room ${roomName}:`, error);
    }
  }

  router.post("/token", async (req, res) => {
    try {
      if (!livekitUrl || !livekitApiKey || !livekitApiSecret) {
        return res.status(400).json({
          error:
            "LiveKit configuration missing. Set LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET on the server or in .sb-config.json.",
        });
      }

      const { sessionId } = req.body as LiveKitTokenRequest;

      // Generate a room name based on session or use a default
      const roomName = sessionId
        ? `onboarding-${sessionId}`
        : `onboarding-${Date.now()}`;

      // Create room with metadata containing the repo root
      const roomMetadata = JSON.stringify({
        repoRoot: repoRoot,
        sessionId: sessionId,
      });

      // Create the room with metadata using RoomServiceClient
      const roomService = new RoomServiceClient(
        livekitUrl.replace("wss://", "https://"),
        livekitApiKey,
        livekitApiSecret
      );

      try {
        await roomService.createRoom({
          name: roomName,
          metadata: roomMetadata,
        });
      } catch {
        // Room might already exist, that's ok
      }

      // Ensure server is connected to this room to provide context
      await connectServerToRoom(roomName);

      // Create access token for user
      const at = new AccessToken(livekitApiKey, livekitApiSecret, {
        identity: `user-${Date.now()}`,
        name: "Onboarding User",
      });

      // Grant permissions
      at.addGrant({
        room: roomName,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
      });

      const token = await at.toJwt();

      res.json({
        token,
        roomName,
        url: livekitUrl,
        repoRoot: repoRoot,
      });
    } catch (error: any) {
      console.error("LiveKit token error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
