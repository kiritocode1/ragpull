import OpenAI from "openai";

export async function generateEmbedding(text: string, client: OpenAI): Promise<number[]> {
  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  const data = response.data[0];
  if (!data) {
    throw new Error("Failed to generate embedding");
  }

  return data.embedding;
}
