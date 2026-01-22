
import { GoogleGenAI, Type } from "@google/genai";
import { Chunk, Entity } from "../types";

// Fix: Initializing GoogleGenAI with exactly the named parameter as required by the guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const EXTRACTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    entities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "The unified name of the concept or entity" },
          description: { type: Type.STRING, description: "A brief definition of the concept in this context" },
          type: { type: Type.STRING, description: "Category (e.g., Person, Technology, Theory, Event)" }
        },
        required: ["name", "description", "type"]
      }
    }
  },
  required: ["entities"]
};

export async function extractEntitiesFromChunks(chunks: Chunk[]): Promise<Entity[]> {
  const model = 'gemini-3-flash-preview';
  
  // To avoid hitting token limits and for better resolution, we process text in batches but here we'll combine for demonstration
  const combinedText = chunks.map(c => `[ID:${c.id}] ${c.text}`).join('\n\n');

  const prompt = `
    Acts as a document intelligence specialist. 
    Analyze the following document fragments.
    1. Identify high-significance thematic entities and concepts.
    2. Perform Entity Resolution: merge synonyms or closely related concepts into a single unified node.
    3. For each entity, determine which specific Chunk IDs ([ID:xxx]) mention it.

    Text:
    ${combinedText}

    Return a JSON object mapping unified concepts to the list of chunk IDs that support them.
  `;

  // Fix: Using ai.models.generateContent correctly and ensuring response is handled as a property access
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          resolvedEntities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                type: { type: Type.STRING },
                chunkIds: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING } 
                }
              },
              required: ["name", "description", "type", "chunkIds"]
            }
          }
        },
        required: ["resolvedEntities"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text || '{}');
    return data.resolvedEntities || [];
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return [];
  }
}

export async function semanticChunking(text: string): Promise<string[]> {
  // LLM-based semantic chunking using gemini-3-flash-preview
  const model = 'gemini-3-flash-preview';
  const prompt = `
    Divide the following text into semantically coherent chunks (paragraphs or groups of paragraphs).
    The text is flat. Return the chunks as an array of strings.
    
    Text:
    ${text}
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          chunks: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["chunks"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text || '{}');
    return data.chunks || [text];
  } catch (e) {
    return text.split(/\n\s*\n/).filter(s => s.trim().length > 0);
  }
}
