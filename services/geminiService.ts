import { GoogleGenAI, Modality } from "@google/genai";
import { RenderingStyle } from '../components/StyleSelector';


const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const getStylePrompt = (style: RenderingStyle): string => {
    switch (style) {
        case 'sketch':
            return "Render this in the style of a clean, artistic, hand-drawn architectural sketch with charcoal shading. Do not furnish it.";
        case 'wireframe':
            return "Convert this into a 3D wireframe model. The output should be a clean, monochrome wireframe representation on a dark background. Do not show any surfaces or furniture.";
        case 'minimalist':
            return "Furnish all rooms with a modern minimalist aesthetic. Use a neutral color palette (whites, greys, beige), clean lines, and uncluttered spaces. Furniture should be functional and simple. Emphasize natural light and high-quality, simple materials like concrete and light wood. The final image must be a high-resolution, professional 3D architectural visualization.";
        case 'cozy':
            return "Furnish all rooms to create a cozy, warm, and inviting atmosphere, like a rustic cottage. Use warm lighting, soft textiles (rugs, curtains, blankets), comfortable furniture, and natural materials like wood and stone. A fireplace in the living area would be a great addition. The final image must be a high-resolution, professional 3D architectural visualization.";
        case 'blueprint':
            return "Convert this into a classic architectural blueprint style. The output should be white lines on a dark blue background. Include basic annotations for room names (e.g., 'Living Room', 'Bedroom 1') in a clean, technical font. Do not include furniture or 3D textures.";
        case 'realistic':
        default:
            return "Fully furnish all rooms with modern, high-quality, realistic furniture that matches the room's designated purpose (e.g., sofas and coffee table in the living room, bed and wardrobe in the bedroom, dining table in the dining area). The final image must be a high-resolution, professional 3D architectural visualization, with natural lighting and textures.";
    }
}

interface ImageData {
    base64ImageData: string;
    mimeType: string;
}

export const generate3DRendering = async (images: ImageData[], style: RenderingStyle, customInstructions: string): Promise<string> => {
  try {
    const styleInstruction = getStylePrompt(style);
    const prompt = `Your task is to act as an expert architectural visualizer. You will convert the provided 2D architectural plan(s) into a single, cohesive, high-fidelity 3D rendering. Follow these steps meticulously:

**Step 1: Analyze the Input**
- Identify all provided images (floor plans, elevations, etc.).
- Scan for the primary structural layout: walls, rooms, doors, and windows.
- Mentally discard all non-structural elements like text, dimensions, watermarks, and furniture icons. Your focus is ONLY on the architectural shell first.

**Step 2: Construct the 3D Model Shell**
- Build a structurally sound 3D model based *exclusively* on the architectural shell from Step 1.
- Ensure all walls are of consistent thickness and connect perfectly at the corners.
- All rooms must be fully enclosed and match the shapes in the plan.
- Place doors and windows precisely where they are indicated.

**Step 3: Apply Style, Materials, and Furnishings**
- Refer to the primary style instruction: **${styleInstruction}**
- If the user has provided custom instructions, prioritize them. Pay close attention to any specified material properties for surfaces (e.g., wood, marble, glass), colors, or furniture styles. User Instructions: "${customInstructions || 'No custom instructions provided.'}"
- When applying materials, ensure they are realistic and high-resolution. For example, if 'light wood flooring' is requested, use a texture that shows a light-colored wood grain and an appropriate sheen. If 'marble countertops' are requested, use a texture with realistic veining.
- Furnish the rooms logically and with high-quality assets that fit the room's scale and purpose, unless the style is 'sketch' or 'wireframe'.

**Step 4: Final Rendering and Quality Check**
- Render the final model from a clear isometric or bird's-eye perspective that showcases the entire layout.
- Before outputting, perform this STRICT QUALITY CHECK:
    - Is the structure 100% accurate to the plans?
    - Are there any floating walls or structural gaps? (Must be NO)
    - Have all text, dimensions, and artifacts from the source image been completely removed? (Must be YES)
    - Is the final image clean, professional, and high-resolution? (Must be YES)
    - Does the perspective clearly show the entire layout? (Must be YES)
    - Have the user's custom instructions been followed? (If any were provided)

The final output must be ONLY the image.`;

    const imageParts = images.map(image => ({
        inlineData: {
            data: image.base64ImageData,
            mimeType: image.mimeType,
        },
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          ...imageParts,
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
    if (String(error).toLowerCase().includes('api key not valid')) {
      throw new Error("Invalid API Key: Please ensure your API key is configured correctly.");
    }
    throw new Error("Failed to generate 3D rendering from Gemini API.");
  }
};

export const upscaleImage = async (base64ImageData: string, mimeType: string): Promise<string> => {
  try {
    const prompt = `Act as a professional image processing expert. Your task is to upscale the provided image to a higher resolution (e.g., 4K). Enhance the details, sharpen the textures, and improve the overall quality without altering the original composition, colors, or artistic style. The final output must be ONLY the upscaled image.`;

    const imagePart = {
      inlineData: {
        data: base64ImageData,
        mimeType: mimeType,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          imagePart,
          { text: prompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return part.inlineData.data;
        }
      }
    }
    
    throw new Error("No upscaled image data found in the API response.");

  } catch (error) {
    console.error("Error calling Gemini API for upscaling:", error);
    if (String(error).toLowerCase().includes('api key not valid')) {
      throw new Error("Invalid API Key: Please ensure your API key is configured correctly.");
    }
    throw new Error("Failed to upscale image via Gemini API.");
  }
};