import * as cheerio from "cheerio";
import TurndownService from "turndown";
// import OpenAI from "openai"; // Not needed for local embeddings
import { vectorStore } from "./vector_store";

const turndownService = new TurndownService();

import { generateEmbedding } from "./embeddings";

// Helper to chunk text
export function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }
  
  return chunks;
}

export async function crawlAndIndex(url: string) {
  console.log(`Crawling ${url}...`);
  vectorStore.clear(); // Clear previous crawl for this demo

  // 1. Fetch HTML
  const response = await fetch(url);
  const html = await response.text();

  // 2. Parse & Cleaning
  const $ = cheerio.load(html);
  
  // Remove clutter
  $("script").remove();
  $("style").remove();
  $("nav").remove();
  $("footer").remove();

  // 3. Convert to Markdown
  const markdown = turndownService.turndown($("body").html() || "");

  // 4. Chunking
  const chunks = chunkText(markdown);
  console.log(`Generated ${chunks.length} chunks.`);

  // 5. Embed & Store
  // Local embedding used


  // Process in batches
  let processedCount = 0;

  for (const chunk of chunks) {
    if (!chunk.trim()) continue;

    try {
        const vector = await generateEmbedding(chunk); // No client passed

        vectorStore.addDocument({
        id: crypto.randomUUID(),
        content: chunk,
        vector: vector,
        metadata: { source: url }
        });
        processedCount++;
    } catch (e) {
        console.warn(`Failed to embed chunk: ${e}`);
    }
  }

  return { success: true, chunks: processedCount, message: "Crawling completed successfully" };
}
