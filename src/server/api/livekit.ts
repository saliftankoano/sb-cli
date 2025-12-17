import { Router } from "express";
import { AccessToken, RoomServiceClient } from "livekit-server-sdk";

interface LiveKitTokenRequest {
  sessionId?: string;
}

export function setupLiveKitRoutes(repoRoot: string): Router {
  const router = Router();

  router.post("/token", async (req, res) => {
    try {
      // LiveKit credentials are provided by the Startblock service env vars only.
      // Users of the CLI do NOT need to supply keys during closed testing.
      const livekitUrl = process.env.LIVEKIT_URL;
      const livekitApiKey = process.env.LIVEKIT_API_KEY;
      const livekitApiSecret = process.env.LIVEKIT_API_SECRET;

      if (!livekitUrl || !livekitApiKey || !livekitApiSecret) {
        return res.status(400).json({
          error:
            "LiveKit configuration missing. Set LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET on the server (end users do not need to configure these).",
        });
      }

      const { sessionId } = req.body as LiveKitTokenRequest;

      // Generate a room name based on session or use a default
      const roomName = sessionId
        ? `onboarding-${sessionId}`
        : `onboarding-${Date.now()}`;

      // Create room with metadata containing the repo root
      // This allows the agent to know which repo to load context from
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

      // Create access token
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
        repoRoot: repoRoot, // Also send to frontend for debugging
      });
    } catch (error: any) {
      console.error("LiveKit token error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
