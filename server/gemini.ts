import { GoogleGenAI } from "@google/genai";

// Referenced from javascript_gemini blueprint
// Using Gemini 2.0 Flash for image editing capabilities

export async function processMangaImage(
  apiKey: string,
  imageBase64: string,
  mimeType: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });

  try {
    // Use Gemini 2.0 Flash with image editing prompt
    // Note: This uses Gemini's image understanding + generation to create
    // a version of the image without text
    const prompt = `You are a professional manga image editor. Look at this manga image carefully. 
    I need you to generate a new version of this exact same image, but with ALL text, speech bubbles, 
    and written characters completely removed. The areas where text existed should be naturally filled 
    in with appropriate manga-style backgrounds, patterns, or art that seamlessly matches the surrounding 
    area. Maintain the exact same art style, shading, line work, and composition. The result should look 
    like a clean manga panel with no text whatsoever.`;

    // Generate edited image using Gemini 2.0 Flash
    const response = await ai.models.generateContent({
      model: "models/gemini-2.5-flash-image",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: imageBase64,
                mimeType: mimeType,
              },
            },
            { text: prompt },
          ],
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
