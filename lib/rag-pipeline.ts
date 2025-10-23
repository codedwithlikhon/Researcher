import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/huggingface"
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector"
import { Pool } from "@neondatabase/serverless"
import pdf from "pdf-parse"
import mammoth from "mammoth"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const config = {
  pool,
  tableName: "documents",
};

export async function processAndStoreDocument(fileUrl: string) {
  console.log("[RAG] Processing new file:", fileUrl);
  const response = await fetch(fileUrl)
  const fileBuffer = await response.arrayBuffer()

  let text: string;
  if (fileUrl.endsWith(".pdf")) {
    const pdfData = await pdf(fileBuffer)
    text = pdfData.text
  } else if (fileUrl.endsWith(".docx")) {
    const docxData = await mammoth.extractRawText({ buffer: fileBuffer as Buffer })
    text = docxData.value
  } else {
    text = new TextDecoder().decode(fileBuffer)
  }

  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 })
  const splits = await textSplitter.createDocuments([text])

  const embeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HUGGINGFACE_API_KEY,
  })

  const vectorStore = new PGVectorStore(embeddings, config);

  await vectorStore.addDocuments(splits);
  console.log("[RAG] File processed and stored in PGVectorStore.");
}

export async function queryVectorStore(query: string) {
  const embeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HUGGINGFACE_API_KEY,
  })

  const vectorStore = new PGVectorStore(embeddings, config);
  const searchResults = await vectorStore.similaritySearchWithScore(query, 5);

  if (searchResults && searchResults.length > 0) {
    console.log("[RAG] Found relevant document chunks in vector store.");
    return searchResults.map(([doc, score]) => ({
      content: doc.pageContent,
      score,
    }))
  }

  return null;
}
