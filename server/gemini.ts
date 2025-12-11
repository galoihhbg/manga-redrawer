import { GoogleGenAI } from "@google/genai";
import type { ProcessingParams } from "@shared/schema";

export async function processMangaImage(
  apiKey: string,
  imageBase64: string,
  mimeType: string,
  maskBase64?: string,
  params?: ProcessingParams,
  modelName?: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });

  // Sử dụng model Flash 1.5 hoặc Pro 1.5 làm mặc định vì khả năng Vision tốt
  const modelId = modelName || "gemini-1.5-pro"; 

  try {
    // 1. Xây dựng Prompt theo phong cách "Universal Restoration"
    // Chúng ta không dùng văn phong kể chuyện, mà dùng keyword dồn dập
    let finalPrompt = "";

    if (params) {
      // Mapping các thông số kỹ thuật thành chỉ dẫn cho Gemini
      // Vì Gemini không có trường 'denoising_strength', ta dùng ngôn ngữ để mô tả mức độ can thiệp
      const creativityLevel = params.denoisingStrength > 0.6 
        ? "high creativity, reconstruct missing details freely" 
        : "strict adherence to surrounding lines, conservative restoration";

      finalPrompt = `
[TASK]
Inpaint the masked area (white pixels in the mask) to restore the background.

[POSITIVE REQUIREMENTS]
${params.prompt}, (masterpiece, best quality), manga style, (context aware inpainting), (restore underlying texture), (fill with matching background pattern), (seamless continuity of lines), clean lineart, highres, ${creativityLevel}.

[NEGATIVE REQUIREMENTS - AVOID]
${params.negativePrompt}, (text, sfx, kanji, sound effects, signature, watermark):2.0, (new object), (foreign artifact), (opaque patch), (complex pattern mismatch), (gray residue), (low quality), (blur).

[TECHNICAL INSTRUCTION]
- Seamlessly blend the edges.
- Do not generate text or speech bubbles.
- Restore the underlying surface texture (e.g., clothes, wall, sky) based on the context.
`;
    } else {
      // Fallback nếu không có params
      finalPrompt = `
[TASK]
Remove text from masked areas and restore background.
(masterpiece), manga style, (context aware inpainting), (restore underlying texture), clean lineart.
Avoid: (text), (speech bubbles), (artifacts).
`;
    }

    // 2. Chuẩn bị các phần dữ liệu (Parts)
    const parts: any[] = [
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType,
        },
      },
    ];

    // Thêm Mask nếu có (Quan trọng: Gemini cần mask để biết sửa chỗ nào)
    if (maskBase64) {
      parts.push({
        inlineData: {
          data: maskBase64,
          mimeType: "image/png", // Mask thường là PNG
        },
      });
      finalPrompt += "\n\nRefer to the second image as the Inpainting Mask (White = Edit, Black = Keep).";
    }

    parts.push({ text: finalPrompt });

    // 3. Gọi Gemini API
    const response = await ai.models.generateContent({
      model: modelId,
      contents: [
        {
          role: "user",
          parts,
        },
      ],
      // Cấu hình generation config để ảnh ổn định hơn
      generationConfig: {
        temperature: 0.4, // Giữ thấp để model bám sát ảnh gốc (tương đương denoising thấp)
        topK: 32,
        topP: 0.95,
      }
    } as any);

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No response generated from Gemini");
    }

    const content = candidates[0].content;
    if (!content || !content.parts) {
      throw new Error("Invalid response structure from Gemini");
    }

    // 4. Trích xuất ảnh kết quả
    for (const part of content.parts) {
      if (part.inlineData && part.inlineData.data) {
        return part.inlineData.data; // Trả về base64
      }
    }

    throw new Error("No image data found in Gemini response");

  } catch (error) {
    console.error("Gemini processing error:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        throw new Error("Invalid API key. Please check your Gemini API key.");
      }
      if (error.message.includes("quota")) { // 429 errors
        throw new Error("API quota exceeded. Please check your Gemini API usage.");
      }
      throw new Error(`Gemini API error: ${error.message}`);
    }
    
    throw new Error("Failed to process image with Gemini AI");
  }
}