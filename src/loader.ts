import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
// import OpenAI from "openai"; // Not needed
import { chunkText } from "./crawler";
import { generateEmbedding } from "./embeddings";
import { vectorStore } from "./vector_store";

export async function ingestDocs(apiKey: string) {
  const docsDir = join(process.cwd(), "docs");
  
  try {
    const files = await readdir(docsDir);
    // const openai = new OpenAI({ apiKey }); // Not needed
    let totalChunks = 0;

    for (const file of files) {
      if (!file.endsWith(".md")) continue;

      const filePath = join(docsDir, file);
      const content = await readFile(filePath, "utf-8");
      
      const chunks = chunkText(content);
      console.log(`Processing ${file}: ${chunks.length} chunks`);

      for (const chunk of chunks) {
        if (!chunk.trim()) continue;

        try {
            // Local embedding
            const vector = await generateEmbedding(chunk);
            
            vectorStore.addDocument({
              id: crypto.randomUUID(),
              content: chunk,
              vector: vector,
              metadata: { source: file }
            });
            totalChunks++;
        } catch (e) {
            console.error(`Error embedding chunk from ${file}:`, e);
        }
      }
    }
    
    return { success: true, count: totalChunks, message: `Ingested ${totalChunks} chunks from local docs.` };

  } catch (error) {
    console.error("Error reading docs directory:", error);
    return { success: false, error: "Failed to read docs directory" };
  }
}
