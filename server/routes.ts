import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { processImageSchema, type ProcessImageResponse } from "@shared/schema";
import { processMangaImage } from "./gemini";

export async function registerRoutes(app: Express): Promise<Server> {
  // Image processing endpoint
  app.post("/api/process-image", async (req, res) => {
    try {
      // Validate request body
      const validation = processImageSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: validation.error.errors[0].message,
        } as ProcessImageResponse);
      }

      const { apiKey, image, mask, mimeType, params } = validation.data;

      // Process image with Gemini
      const processedImageBase64 = await processMangaImage(
        apiKey,
        image,
        mimeType,
        mask,
        params
      );

      res.json({
        success: true,
        processedImage: processedImageBase64,
      } as ProcessImageResponse);
    } catch (error) {
      console.error("Image processing error:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to process image",
      } as ProcessImageResponse);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
