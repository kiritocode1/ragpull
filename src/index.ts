import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import { html } from "@elysiajs/html";

// Placeholder imports for services (we will implement these next)
import { crawlAndIndex } from "./crawler";
import { generateAnswer } from "./rag";
import { ingestDocs } from "./loader";

const app = new Elysia()
  .use(staticPlugin())
  .use(html())
  .get("/", () => Bun.file("public/index.html"))
  .post("/api/crawl", async ({ body, set }) => {
    try {
      const reqBody = body as { url: string; apiKey?: string };
      const url = reqBody.url;
      // API Key not used for crawling (local embeddings)
      
      if (!url) {
        set.status = 400;
        return { error: "Missing URL" };
      }
      
      const result = await crawlAndIndex(url);
      return result;
    } catch (e: any) {
      set.status = 500;
      return { error: e.message };
    }
  })
  .post("/api/ingest", async ({ body, set }) => {
    try {
        // const reqBody = body as { apiKey?: string }; // Not needed
        // API Key not used for ingestion
        
        const result = await ingestDocs();
        return result;
    } catch (e: any) {
        set.status = 500;
        return { error: e.message };
    }
  })
  .post("/api/chat", async ({ body, set }) => {
    try {
      const reqBody = body as { query: string; apiKey?: string };
      const query = reqBody.query;
      const apiKey = reqBody.apiKey || Bun.env.GROQ_API_KEY || "";

      if (!query || !apiKey) {
        set.status = 400;
        return { error: "Missing query or API Key" };
      }

      const result = await generateAnswer(query, apiKey);
      return result;
    } catch (e: any) {
        set.status = 500;
        return { error: e.message };
    }
  })
  .listen(3000);

console.log(
  `Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
