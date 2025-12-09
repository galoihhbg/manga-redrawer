import { GoogleGenAI } from "@google/genai";
import type { ProcessingParams } from "@shared/schema";

// Referenced from javascript_gemini blueprint
// Using Gemini 2.0 Flash for image editing capabilities

export async function processMangaImage(
  apiKey: string,
  imageBase64: string,
  mimeType: string,
  maskBase64?: string,
  params?: ProcessingParams,
  modelName?: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });

  // Default to gemini-2.5-flash-image if no model specified
  const model = modelName || "models/gemini-3-pro-image-preview";

  try {
    // Use custom prompt if provided, otherwise use default
    const defaultPrompt = `You are a professional manga image editor. Look at this manga image carefully. 
    I need you to generate a new version of this exact same image, but with ALL text, speech bubbles, 
    and written characters completely removed. The areas where text existed should be naturally filled 
    in with appropriate manga-style backgrounds, patterns, or art that seamlessly matches the surrounding 
    area. Maintain the exact same art style, shading, line work, and composition. The result should look 
    like a clean manga panel with no text whatsoever.`;

    let prompt = defaultPrompt;
    
    if (params) {
      // Build a comprehensive prompt using the provided parameters
      prompt = `You are a professional manga image editor using advanced inpainting techniques.

Task: Generate a new version of this manga image with text removed from the masked areas.

Positive Requirements:
${params.prompt}

Things to Avoid:
${params.negativePrompt}

Technical Parameters:
- Denoising Strength: ${params.denoisingStrength} (higher = more aggressive changes)
- Mask Blur: ${params.maskBlur}px (edge softness)
- Padding: ${params.padding}px (extra context area)
- Mask Content Mode: ${params.maskContent}
- Inpaint Area: ${params.inpaintArea}

${maskBase64 ? 'A mask image is provided showing the areas to inpaint (white regions should be filled).' : 'Remove all text you detect.'}

Generate a seamless, high-quality manga image that looks natural and maintains the original art style.`;
    }

    const parts: any[] = [
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType,
        },
      },
    ];

    // Add mask if provided
    if (maskBase64) {
      parts.push({
        inlineData: {
          data: maskBase64,
          mimeType: "image/png",
        },
      });
    }

    parts.push({ text: prompt });

    // Generate edited image using the selected model
    const response = await ai.models.generateContent({
      model: model,
      contents: [
        {
          role: "user",
          parts,
        },
      ],
      // SDK type may not include all supported modalities; cast the request to any to bypass type errors
    } as any);

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No response generated from Gemini");
    }

    const content = candidates[0].content;
    if (!content || !content.parts) {
      throw new Error("Invalid response structure from Gemini");
    }

    // Find the image part in the response
    for (const part of content.parts) {
      if (part.inlineData && part.inlineData.data) {
        return part.inlineData.data; // Return base64 image data
      }
    }

    throw new Error("No image data found in Gemini response");
  } catch (error) {
    console.error("Gemini processing error:", error);
    
    // Provide more helpful error messages
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        throw new Error("Invalid API key. Please check your Gemini API key.");
      }
      if (error.message.includes("quota")) {
        throw new Error("API quota exceeded. Please check your Gemini API usage.");
      }
      throw new Error(`Gemini API error: ${error.message}`);
    }
    
    throw new Error("Failed to process image with Gemini AI");
  }
}
