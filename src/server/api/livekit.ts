import { Router } from "express";
import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import { loadConfig } from "../../config/loader.js";
import * as path from "path";

interface LiveKitTokenRequest {
  sessionId?: string;
}

export function setupLiveKitRoutes(repoRoot: string): Router {
  const router = Router();

  router.post("/token", async (req, res) => {
    try {
      const config = await loadConfig(repoRoot);

      // Check for LiveKit config
      const livekitUrl = process.env.LIVEKIT_URL || config.livekit?.url;
      const livekitApiKey =
        process.env.LIVEKIT_API_KEY || config.livekit?.apiKey;
      const livekitApiSecret =
        process.env.LIVEKIT_API_SECRET || config.livekit?.apiSecret;

      if (!livekitUrl || !livekitApiKey || !livekitApiSecret) {
        return res.status(400).json({
          error:
            "LiveKit configuration missing. Please set LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET in your environment or .sb-config.json",
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
