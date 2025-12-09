import { z } from "zod";

// Processing parameters schema
export const processingParamsSchema = z.object({
  prompt: z.string(),
  negativePrompt: z.string(),
  denoisingStrength: z.number().min(0).max(1),
  maskBlur: z.number().min(0),
  padding: z.number().min(0),
  maskContent: z.enum(['original', 'fill', 'latent_noise']),
  inpaintArea: z.enum(['only_masked', 'whole_picture']),
});

// Image processing request schema
export const processImageSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
  image: z.string(), // base64 encoded image
  mask: z.string().optional(), // base64 encoded mask (optional for backward compatibility)
  mimeType: z.string(),
  model: z.string().optional(), // AI model to use
  params: processingParamsSchema.optional(),
});

export type ProcessImageRequest = z.infer<typeof processImageSchema>;
export type ProcessingParams = z.infer<typeof processingParamsSchema>;

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
