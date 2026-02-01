
import { generateEmbedding } from "./src/embeddings";

async function test() {
  console.log("Testing embedding...");
  try {
    const vector = await generateEmbedding("Hello world");
    console.log("Vector length:", vector.length);
  } catch (e) {
    console.error("Error:", e);
  }
}

test();
