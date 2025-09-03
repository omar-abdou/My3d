
import { GoogleGenAI, Modality } from "@google/genai";
import { RenderingStyle } from '../components/StyleSelector';


const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const getStylePrompt = (style: RenderingStyle): string => {
    switch (style) {
        case 'sketch':
            return "Render this in the style of a clean, artistic, hand-drawn architectural sketch with charcoal shading. Do not furnish it.";
        case 'wireframe':
            return "Convert this into a 3D wireframe model. The output should be a clean, monochrome wireframe representation on a dark background. Do not show any surfaces or furniture.";
        case 'realistic':
        default:
            return "Fully furnish all rooms with modern, high-quality, realistic furniture that matches the room's designated purpose (e.g., sofas and coffee table in the living room, bed and wardrobe in the bedroom, dining table in the dining area). The final image must be a high-resolution, professional 3D architectural visualization, with natural lighting and textures.";
    }
}

export const generate3DRendering = async (base64ImageData: string, mimeType: string, style: RenderingStyle): Promise<string> => {
  try {
    const styleInstruction = getStylePrompt(style);
    const prompt = `Transform this 2D architectural floor plan into a 3D rendering. The viewpoint should be an isometric or bird's-eye view, showcasing the entire layout clearly. Accurately represent the layout, room dimensions, and element placements (doors, windows) from the original plan. ${styleInstruction} Do not include any text, labels, or dimensions in the final image.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    // Find the image part in the response
    if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return part.inlineData.data;
        }
      }
    }
    
    throw new Error("No image data found in the API response.");

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    
    // Check if it's a quota exceeded error
    if (error && typeof error === 'object' && 'error' in error) {
      const apiError = error as any;
      if (apiError.error?.code === 429 || apiError.error?.status === 'RESOURCE_EXHAUSTED') {
        throw new Error("تم تجاوز حد الاستخدام المسموح لواجهة برمجة التطبيقات. يرجى التحقق من خطة الاشتراك أو المحاولة مرة أخرى لاحقاً.");
      }
    }
    
    throw new Error("Failed to generate 3D rendering from Gemini API.");
  }
};
