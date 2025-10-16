import { GoogleGenAI } from "@google/genai";

// Referenced from javascript_gemini blueprint
// Using Gemini 2.5 Flash for image editing capabilities

async function compositeImageWithMask(
  imageBase64: string,
  maskBase64: string,
  mimeType: string
): Promise<{ compositeBase64: string; mimeType: string }> {
  // Create a composite image where masked regions are filled with a distinct color
  // This gives Gemini a clear visual indication of what needs to be inpainted
  const { createCanvas, loadImage } = await import("canvas");
  
  const imageBuffer = Buffer.from(imageBase64, "base64");
  const maskBuffer = Buffer.from(maskBase64, "base64");
  
  const image = await loadImage(imageBuffer);
  const mask = await loadImage(maskBuffer);
  
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext("2d");
  
  // Draw original image
  ctx.drawImage(image, 0, 0);
  
  // Get mask data
  const maskCanvas = createCanvas(mask.width, mask.height);
  const maskCtx = maskCanvas.getContext("2d");
  maskCtx.drawImage(mask, 0, 0);
  const maskData = maskCtx.getImageData(0, 0, mask.width, mask.height);
  
  // Get image data
  const imageData = ctx.getImageData(0, 0, image.width, image.height);
  
  // Apply mask: where mask is white, fill with semi-transparent white overlay
  for (let i = 0; i < maskData.data.length; i += 4) {
    const maskValue = maskData.data[i]; // R channel (grayscale)
    if (maskValue > 128) { // White region in mask
      // Fill with white to indicate region to inpaint
      imageData.data[i] = 255;     // R
      imageData.data[i + 1] = 255; // G
      imageData.data[i + 2] = 255; // B
      // Keep alpha
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
  
  // Convert to base64
  const buffer = canvas.toBuffer("image/png");
  return {
    compositeBase64: buffer.toString("base64"),
    mimeType: "image/png"
  };
}

export async function processMangaImage(
  apiKey: string,
  imageBase64: string,
  mimeType: string,
  maskBase64?: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });

  try {
    let prompt: string;
    let imageToProcess = imageBase64;
    let imageType = mimeType;

    if (maskBase64) {
      // Create a composite image with white regions indicating areas to inpaint
      const composite = await compositeImageWithMask(imageBase64, maskBase64, mimeType);
      imageToProcess = composite.compositeBase64;
      imageType = composite.mimeType;
      
      prompt = `You are a professional manga image editor. In this manga image, the WHITE/BLANK regions need to be filled in. 
      These white areas should be naturally inpainted with appropriate manga-style backgrounds, patterns, or art that seamlessly 
      matches the surrounding area. Look carefully at the art style, shading, and line work around each white region, then 
      generate natural-looking content that fills these areas perfectly. The result should look like a complete, professional 
      manga panel with no white gaps or obvious edits. Maintain the exact same art style throughout.`;
    } else {
      prompt = `You are a professional manga image editor. Look at this manga image carefully. 
      I need you to generate a new version of this exact same image, but with ALL text, speech bubbles, 
      and written characters completely removed. The areas where text existed should be naturally filled 
      in with appropriate manga-style backgrounds, patterns, or art that seamlessly matches the surrounding 
      area. Maintain the exact same art style, shading, line work, and composition. The result should look 
      like a clean manga panel with no text whatsoever.`;
    }

    // Generate edited image using Gemini 2.5 Flash
    const response = await ai.models.generateContent({
      model: "models/gemini-2.5-flash-image",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: imageToProcess,
                mimeType: imageType,
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
