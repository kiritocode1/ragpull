import { generateEmbedding } from "./embeddings";
import OpenAI from "openai";
import { vectorStore } from "./vector_store";

export async function generateAnswer(query: string, apiKey: string) {
  const openai = new OpenAI({ apiKey });

  // 1. Embed Query
  const queryVector = await generateEmbedding(query, openai);

  // 2. Retrieve Documents
  const relevantDocs = vectorStore.search(queryVector, 5); // Retrieve top 5
  
  if (relevantDocs.length === 0) {
      return { 
          answer: "I couldn't find any relevant information in the crawled content to answer your question.", 
          sources: [] 
      };
  }

  // 3. Construct Prompt
  const context = relevantDocs.map(doc => doc.content).join("\n---\n");
  
  const systemPrompt = `You are a helpful assistant. Answer the user's question based ONLY on the following context. 
  If the answer is not in the context, say you don't know.
  
  Context:
  ${context}`;

  // 4. Generate Answer
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: query },
    ],
  });

  const answer = completion.choices[0]?.message?.content || "No answer generated.";
  const sources = [...new Set(relevantDocs.map(d => d.metadata.source))]; // Unique sources

  return { answer, sources };
}
