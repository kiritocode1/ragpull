import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import { html } from "@elysiajs/html";

// Placeholder imports for services (we will implement these next)
import { crawlAndIndex } from "./crawler";
import { generateAnswer } from "./rag";

const app = new Elysia()
  .use(staticPlugin())
  .use(html())
  .get("/", () => Bun.file("public/index.html"))
  .post("/api/crawl", async ({ body, set }) => {
    try {
      const { url, apiKey } = body as { url: string; apiKey: string };
      if (!url || !apiKey) {
        set.status = 400;
        return { error: "Missing URL or API Key" };
      }
      
      const result = await crawlAndIndex(url, apiKey);
      return result;
    } catch (e: any) {
      set.status = 500;
      return { error: e.message };
    }
  })
  .post("/api/chat", async ({ body, set }) => {
    try {
      const { query, apiKey } = body as { query: string; apiKey: string };
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
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
