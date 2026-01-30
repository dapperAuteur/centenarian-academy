import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * Generates a 1536-dimensional embedding vector for a given text.
 * Used for storing transcripts in Supabase pgvector for semantic recommendations.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    
    // Clean and truncate text if necessary (Gemini handles large inputs well, but safety first)
    const sanitizedText = text.replace(/\s+/g, ' ').trim().substring(0, 30000);
    
    const result = await model.embedContent(sanitizedText);
    const embedding = result.embedding;
    
    return embedding.values;
  } catch (error) {
    console.error("Gemini Embedding Error:", error);
    throw new Error("Failed to generate AI embedding for transcript.");
  }
}