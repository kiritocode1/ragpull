# RAG Bot Project Plan

This project implements a Retrieval Augmented Generation (RAG) bot from scratch.

## Architecture

- **Runtime**: Bun
- **API Framework**: Elysia
- **LLM/Embeddings**: OpenAI (gpt-4o-mini / text-embedding-3-small)
- **Vector Store**: Local In-Memory (Simple Cosine Similarity)
- **Crawler**: `fetch` + `cheerio` + `turndown`
- **Frontend**: Single HTML file with Glassmorphism UI

## Workflow Steps

### 1. Setup & Configuration

- [x] Initialize project
- [x] Install dependencies (`cheerio`, `openai`, `elysia`, `turndown`)
- [x] Setup Project Structure

### 2. The Crawler (`src/crawler.ts`)

- [x] Implement function to fetch raw HTML.
- [x] Parse HTML with `cheerio` to clean content.
- [x] Convert to Markdown with `turndown`.
- [x] Chunk text.
- [x] Generate Embeddings.

### 3. Vector Store (`src/vector_store.ts`)

- [x] Document interface.
- [x] In-memory storage.
- [x] Cosine Similarity Search.

### 4. API & RAG Logic (`src/index.ts` & `src/rag.ts`)

- [x] Setup Elysia server.
- [x] Endpoint `POST /api/crawl`.
- [x] Endpoint `POST /api/chat`.
- [x] RAG Logic (Retrieve -> Prompt -> Answer).

### 5. Frontend (`public/index.html`)

- [x] Glassmorphism Design.
- [x] API Key & URL Configuration UI.
- [x] Chat Interface (User/Bot bubbles).
- [x] Real-time logs for crawling.

## Usage

1. Run `bun run src/index.ts`
2. Open `http://localhost:3000`
3. Enter OpenAI API Key & Target URL.
4. Click "Start Crawling".
5. Ask questions!
