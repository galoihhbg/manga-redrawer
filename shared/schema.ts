import { z } from "zod";

// Point for polygon coordinates
const pointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

// Image processing request schema
export const processImageSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
  image: z.string(), // base64 encoded image
  mimeType: z.string(),
  mask: z.string().optional(), // base64 encoded mask image (white = edit region, black = preserve)
  polygons: z.array(z.array(pointSchema)).optional(), // array of polygons for visualization
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
