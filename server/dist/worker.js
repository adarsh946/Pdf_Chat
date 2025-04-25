"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const pdf_1 = require("@langchain/community/document_loaders/fs/pdf");
const qdrant_1 = require("@langchain/qdrant");
const openai_1 = require("@langchain/openai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const worker = new bullmq_1.Worker("upload-pdf", (job) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Docs: ", job.data);
    const data = JSON.parse(job.data);
    // load pdf
    const loader = new pdf_1.PDFLoader(data.path);
    const docs = yield loader.load();
    // store it in qdrant vector store
    const embeddings = new openai_1.OpenAIEmbeddings({
        model: "text-embedding-3-small",
        apiKey: process.env.OPENAI_API_KEY,
    });
    const vectorStore = yield qdrant_1.QdrantVectorStore.fromExistingCollection(embeddings, {
        url: "http://localhost:6333",
        collectionName: "pdf-testing",
    });
    yield vectorStore.addDocuments(docs);
    console.log("documents are uploaded to vector database..");
}), {
    concurrency: 100,
    connection: {
        host: "localhost",
        port: 6379,
    },
});
