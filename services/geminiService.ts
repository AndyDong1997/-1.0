
import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";

const MODEL_TEXT = 'gemini-3-pro-preview';
const MODEL_IMAGE = 'gemini-3-pro-image-preview';
const MODEL_VIDEO = 'veo-3.1-fast-generate-preview';

/**
 * Creates a fresh instance of the AI client.
 * Required for Pro models to ensure the latest selected API key is used.
 */
const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const checkApiKeySelection = async () => {
  if (typeof window.aistudio?.hasSelectedApiKey === 'function') {
    return await window.aistudio.hasSelectedApiKey();
  }
  return true; // Fallback if not in AI Studio environment
};

export const openApiKeySelector = async () => {
  if (typeof window.aistudio?.openSelectKey === 'function') {
    await window.aistudio.openSelectKey();
  }
};

const cleanBase64 = (base64: string) => {
  if (!base64) return '';
  return base64.includes('base64,') ? base64.split('base64,')[1] : base64;
};

export const generateText = async (prompt: string, systemInstruction?: string, useSearch = false): Promise<{ text: string; sources?: any[] }> => {
  const ai = getAi();
  const config: any = { systemInstruction };
  
  if (useSearch) {
    config.tools = [{ googleSearch: {} }];
  }

  const response = await ai.models.generateContent({
    model: MODEL_TEXT,
    contents: prompt,
    config,
  });

  return {
    text: response.text || '',
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks
  };
};

export const generateStructuredText = async <T,>(prompt: string, schema: any, systemInstruction?: string): Promise<T> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: MODEL_TEXT,
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });
  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("JSON Parse Error:", response.text);
    throw e;
  }
};

export const generateImages = async (prompt: string, config: { aspectRatio: string; imageSize: string }, sourceImageBase64?: string): Promise<string[]> => {
  const ai = getAi();
  
  const parts: any[] = [{ text: prompt }];
  
  if (sourceImageBase64) {
    parts.unshift({
      inlineData: {
        data: cleanBase64(sourceImageBase64),
        mimeType: 'image/jpeg'
      }
    });
  }

  const response = await ai.models.generateContent({
    model: MODEL_IMAGE,
    contents: { parts },
    config: {
      imageConfig: {
        aspectRatio: config.aspectRatio as any,
        imageSize: config.imageSize as any,
      }
    },
  });

  const images: string[] = [];
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
      }
    }
  }
  return images;
};

export const reverseImagePrompt = async (base64Image: string): Promise<string> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: MODEL_IMAGE,
    contents: {
      parts: [
        { inlineData: { data: cleanBase64(base64Image), mimeType: 'image/jpeg' } },
        { text: "Act as an expert prompt engineer. Analyze this product image and provide a highly detailed text-to-image prompt in English. Describe the product, materials, lighting, background, and camera angle. Output ONLY the prompt string." }
      ]
    }
  });
  return response.text || '';
};

/**
 * Generates a video using Veo 3.1
 */
export const startVideoGeneration = async (prompt: string, aspectRatio: '16:9' | '9:16' = '9:16') => {
  const ai = getAi();
  const operation = await ai.models.generateVideos({
    model: MODEL_VIDEO,
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio
    }
  });
  return operation;
};

export const pollVideoOperation = async (operation: any) => {
  const ai = getAi();
  return await ai.operations.getVideosOperation({ operation });
};

export const getDownloadableVideoUrl = async (uri: string) => {
  return `${uri}&key=${process.env.API_KEY}`;
};
