import { Router } from "express";
import { AccessToken, RoomServiceClient } from "livekit-server-sdk";

interface LiveKitTokenRequest {
  sessionId?: string;
}

export function setupLiveKitRoutes(
  repoRoot: string,
  config?: { url?: string; apiKey?: string; apiSecret?: string }
): Router {
  const router = Router();

  const livekitUrl = process.env.LIVEKIT_URL || config?.url;
  const livekitApiKey = process.env.LIVEKIT_API_KEY || config?.apiKey;
  const livekitApiSecret = process.env.LIVEKIT_API_SECRET || config?.apiSecret;

  router.post("/token", async (req, res) => {
    try {
      if (!livekitUrl || !livekitApiKey || !livekitApiSecret) {
        return res.status(400).json({
          error:
            "LiveKit configuration missing. Set LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET on the server or in .sb-config.json.",
        });
      }

      const { sessionId } = req.body as LiveKitTokenRequest;
      const roomName = sessionId
        ? `onboarding-${sessionId}`
        : `onboarding-${Date.now()}`;

      // Create the room with metadata
      const roomService = new RoomServiceClient(
        livekitUrl.replace("wss://", "https://"),
        livekitApiKey,
        livekitApiSecret
      );

      try {
        await roomService.createRoom({
          name: roomName,
          metadata: JSON.stringify({ repoRoot, sessionId }),
        });
      } catch {
        // Room might already exist
      }

      // Create access token for user
      const at = new AccessToken(livekitApiKey, livekitApiSecret, {
        identity: `user-${Date.now()}`,
        name: "Onboarding User",
      });

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
