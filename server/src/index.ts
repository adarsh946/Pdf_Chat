import express from "express";
import cors from "cors";
import multer from "multer";
import { Queue } from "bullmq";
import dotenv from "dotenv";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
import OpenAI from "openai";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const myQueue = new Queue("upload-pdf", {
  connection: {
    host: "localhost",
    port: 6379,
  },
});

const app = express();
app.use(cors());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});
const upload = multer({ storage: storage });

app.post("/upload/pdf", upload.single("pdf"), async function (req, res) {
  await myQueue.add(
    "file-ready",
    JSON.stringify({
      fileName: req.file?.originalname,
      destination: req.file?.destination,
      path: req.file?.path,
    })
  );
  console.log(req.file, req.body);
  res.status(200).json({
    message: "File uploaded successfully!",
  });
});

app.get("/chat-pdf", async (req, res) => {
  const userQuery = req.query.message as string;
  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
    apiKey: process.env.OPENAI_API_KEY,
  });
  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      url: "http://localhost:6333",
      collectionName: "pdf-testing",
    }
  );
  const retriever = vectorStore.asRetriever({ k: 2 });
  const result = await retriever.invoke(userQuery);

  const SYSTEM_PROMPT = `you are a helpful AI Assistant whose work to response on the user query based on the given CONTEXT.
  CONTEXT :
  ${JSON.stringify(result)}
  `;

  const chatResponse = client.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userQuery },
    ],
  });

  res.status(200).json({
    message: (await chatResponse).choices[0].message.content,
    docs: result,
  });
});

app.listen(8000, () => console.log(`Port is running on 8000`));
