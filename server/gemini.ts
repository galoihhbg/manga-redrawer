import { GoogleGenAI } from "@google/genai";

// Referenced from javascript_gemini blueprint
// Using Gemini 2.5 Flash for image editing capabilities

async function compositeImageWithMask(
  imageBase64: string,
  maskBase64: string,
  mimeType: string
): Promise<{ compositeBase64: string; mimeType: string }> {
  const { createCanvas, loadImage } = await import("canvas");

  const imageBuffer = Buffer.from(imageBase64, "base64");
  const maskBuffer = Buffer.from(maskBase64, "base64");

  const image = await loadImage(imageBuffer);
  const mask = await loadImage(maskBuffer);

  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext("2d");

  // 1. Vẽ ảnh gốc
  ctx.drawImage(image, 0, 0);

  // Lấy dữ liệu pixel của ảnh gốc và mask
  const maskCanvas = createCanvas(mask.width, mask.height);
  const maskCtx = maskCanvas.getContext("2d");
  maskCtx.drawImage(mask, 0, 0);
  const maskData = maskCtx.getImageData(0, 0, mask.width, mask.height);
  const imageData = ctx.getImageData(0, 0, image.width, image.height);

  const { data: imgPixelData } = imageData;
  const { data: maskPixelData, width: maskWidth } = maskData;

  // 2. Xử lý từng pixel để tạo vùng trong suốt và viền đỏ
  for (let i = 0; i < maskPixelData.length; i += 4) {
    const isWhiteInMask = maskPixelData[i] > 128; // Kiểm tra kênh R (ảnh xám)

    if (isWhiteInMask) {
      const x = (i / 4) % maskWidth;
      const y = Math.floor((i / 4) / maskWidth);

      // Kiểm tra các pixel lân cận để xác định có phải là viền hay không
      const neighbors = [
        (y - 1) * maskWidth + x, // trên
        (y + 1) * maskWidth + x, // dưới
        y * maskWidth + (x - 1), // trái
        y * maskWidth + (x + 1), // phải
      ];

      let isEdge = false;
      for (const neighborIndex of neighbors) {
        const neighborPixelStart = neighborIndex * 4;
        // Nếu lân cận nằm ngoài ảnh hoặc là màu đen, thì đây là viền
        if (
          neighborPixelStart < 0 ||
          neighborPixelStart >= maskPixelData.length ||
          maskPixelData[neighborPixelStart] < 128
        ) {
          isEdge = true;
          break;
        }
      }

      if (isEdge) {
        // Nếu là viền, tô màu đỏ
        imgPixelData[i] = 255;     // R
        imgPixelData[i + 1] = 0;   // G
        imgPixelData[i + 2] = 0;   // B
        imgPixelData[i + 3] = 255; // Alpha (không trong suốt)
      } else {
        // Nếu không phải viền (nằm bên trong), làm cho nó trong suốt
        imgPixelData[i + 3] = 0; // Alpha
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // 3. Chuyển đổi sang base64
  const buffer = canvas.toBuffer("image/png"); // PNG để hỗ trợ trong suốt
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

    prompt = `You are a highly precise manga image cleaning and redraw specialist. Your absolute priority is to **PRESERVE THE ORIGINAL IMAGE DIMENSIONS (WIDTH AND HEIGHT) AND ASPECT RATIO** in the final output.

In this image, the **TRANSPARENT AREAS OUTLINED IN RED** are the **EXACT AND ONLY AREAS** where you are permitted to make changes. These outlined regions indicate where **Japanese or Chinese text/characters** were originally present.

Your tasks are:
1.  **STRICTLY MAINTAIN THE EXACT PIXEL DIMENSIONS (WIDTH AND HEIGHT) of the input image.** The output must not be cropped, scaled, or resized in any way.
2.  **Strictly confine all edits to WITHIN the red-outlined transparent regions.**
3.  **The red outline ITSELF is a visual guide and MUST NOT appear in the final output.**
4.  **Completely remove all Japanese or Chinese text/characters** that were inside the outlined area.
5.  **Perform a seamless redraw/inpaint** within these transparent regions. Restore the underlying background, patterns, or art.
6.  The redraw must meticulously **match the surrounding manga art style, line work, shading, and existing textures**.

7.  **ABSOLUTELY DO NOT:**
    * **CROP, SCALE, OR ALTER THE IMAGE DIMENSIONS.**
    * **ADD any new text, speech bubbles, sound effects, or any other elements.**
    * **MODIFY, redraw, or alter any part of the image OUTSIDE the red-outlined regions** (this includes panel borders, character art, or any other visual detail).
    * **Remove or alter the speech bubble outlines themselves.**

The final output must be an image with the **exact same dimensions as the input**, but with Japanese/Chinese text seamlessly removed and the background perfectly restored ONLY within the masked areas.`;
    } else {
      prompt = `You are a professional manga editor, specializing in high-quality *cleaning* and *redraw*. Your goal is to create a *textless* version of this manga panel.

Your task is:
1.  **Identify and remove** ALL text, written characters, sound effects (SFX), and **speech/thought bubbles** from the image.
2.  For every removed element (text, SFX, bubble), you must **seamlessly redraw/inpaint** the underlying background, panel borders, or character details.
3.  **Restore the background** using the surrounding manga-style patterns, patterns, screentones, or line work. The restoration must be perfect, maintaining the exact same art style, shading, and composition. The result must look like a clean manga panel with no text or bubbles whatsoever.
4.  **DO NOT** arbitrarily change or redraw any part of the image that did not contain text or a speech bubble. Maintain all characters, actions, and non-text visual effects precisely as they are.`;
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
    console.log(content)
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
