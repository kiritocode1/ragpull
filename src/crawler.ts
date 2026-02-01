import * as cheerio from "cheerio";
import TurndownService from "turndown";
import OpenAI from "openai";
import { vectorStore } from "./vector_store";

const turndownService = new TurndownService();

// Helper to chunk text
function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }
  
  return chunks;
}

export async function crawlAndIndex(url: string, apiKey: string) {
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
  const openai = new OpenAI({ apiKey });

  // Process in batches to avoid rate limits if necessary, 
  // but for simplicity we'll map all (or small batches)
  let processedCount = 0;

  for (const chunk of chunks) {
    if (!chunk.trim()) continue;

    const embeddingParams = {
      model: "text-embedding-3-small",
      input: chunk,
    };
    
    // Note: OpenAI embeddings usually return data[0].embedding
    const embeddingResponse = await openai.embeddings.create(embeddingParams);
    const vector = embeddingResponse.data[0].embedding;

    vectorStore.addDocument({
      id: crypto.randomUUID(),
      content: chunk,
      vector: vector,
      metadata: { source: url }
    });
    processedCount++;
  }

  return { success: true, chunks: processedCount, message: "Crawling completed successfully" };
}
