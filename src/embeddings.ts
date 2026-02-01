import { pipeline } from "@xenova/transformers";

// Singleton to hold the pipeline
let extractor: any = null;

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!extractor) {
    console.log("DEBUG: Initializing local embedding model (Xenova)...");
    console.log("DEBUG: If you see this, we are strictly local.");
    // downloading and loading the model locally
    extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  
  // pooling: 'mean' and normalize: true are standard for sentence embeddings
  const output = await extractor(text, { pooling: "mean", normalize: true });
  
  // output.data is a Float32Array
  return Array.from(output.data);
}
