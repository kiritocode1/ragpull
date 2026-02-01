export interface Document {
  id: string;
  content: string;
  vector: number[];
  metadata: Record<string, any>;
}

class VectorStore {
  private documents: Document[] = [];

  addDocument(doc: Document) {
    this.documents.push(doc);
  }

  // Simple Cosine Similarity Search
  search(queryVector: number[], k: number = 3): Document[] {
    if (this.documents.length === 0) return [];

    const scores = this.documents.map((doc) => {
      const score = this.cosineSimilarity(queryVector, doc.vector);
      return { doc, score };
    });

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);

    return scores.slice(0, k).map((s) => s.doc);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * (b[i] ?? 0), 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
  
  clear() {
      this.documents = [];
  }
}

export const vectorStore = new VectorStore();
