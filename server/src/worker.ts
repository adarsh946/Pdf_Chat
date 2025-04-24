import { Worker } from "bullmq";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";

const worker = new Worker(
  "upload-pdf",
  async (job) => {
    console.log("Docs: ", job.data);
    const data = JSON.parse(job.data);

    // load pdf
    const loader = new PDFLoader(data.path);
    const docs = await loader.load();

    // console.log(docs);
    // split it into chunks

    // const textSplitter = new RecursiveCharacterTextSplitter({
    //   chunkSize: 100,
    //   chunkOverlap: 20,
    // });
    // const texts = await textSplitter.splitText(docs.toString());
    // console.log(texts[0]);

    // store it in qdrant vector store

    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-small",
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: "http://localhost:6333",
        collectionName: "pdf-testing",
      }
    );
    await vectorStore.addDocuments(docs);
    console.log("documents are uploaded to vector database..");
  },
  {
    concurrency: 100,
    connection: {
      host: "localhost",
      port: 6379,
    },
  }
);
