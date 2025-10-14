import { z } from "zod";

// Image processing request schema
export const processImageSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
  image: z.string(), // base64 encoded image
  mimeType: z.string(),
});

export type ProcessImageRequest = z.infer<typeof processImageSchema>;

// Image processing response
export interface ProcessImageResponse {
  success: boolean;
  processedImage?: string; // base64 encoded processed image
  error?: string;
}

// Frontend state types
export interface ImageData {
  file: File;
  preview: string;
  processedImage?: string;
  isProcessing?: boolean;
  error?: string;
}
