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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const bullmq_1 = require("bullmq");
const dotenv_1 = __importDefault(require("dotenv"));
const qdrant_1 = require("@langchain/qdrant");
const openai_1 = require("@langchain/openai");
const openai_2 = __importDefault(require("openai"));
dotenv_1.default.config();
const client = new openai_2.default({
    apiKey: process.env.OPENAI_API_KEY,
});
const myQueue = new bullmq_1.Queue("upload-pdf", {
    connection: {
        host: "localhost",
        port: 6379,
    },
});
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
});
const upload = (0, multer_1.default)({ storage: storage });
app.post("/upload/pdf", upload.single("pdf"), function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        yield myQueue.add("file-ready", JSON.stringify({
            fileName: (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname,
            destination: (_b = req.file) === null || _b === void 0 ? void 0 : _b.destination,
            path: (_c = req.file) === null || _c === void 0 ? void 0 : _c.path,
        }));
        console.log(req.file, req.body);
        res.status(200).json({
            message: "File uploaded successfully!",
        });
    });
});
app.get("/chat-pdf", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userQuery = req.query.message;
    const embeddings = new openai_1.OpenAIEmbeddings({
        model: "text-embedding-3-small",
        apiKey: process.env.OPENAI_API_KEY,
    });
    const vectorStore = yield qdrant_1.QdrantVectorStore.fromExistingCollection(embeddings, {
        url: "http://localhost:6333",
        collectionName: "pdf-testing",
    });
    const retriever = vectorStore.asRetriever({ k: 2 });
    const result = yield retriever.invoke(userQuery);
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
        message: (yield chatResponse).choices[0].message.content,
        docs: result,
    });
}));
app.listen(8000, () => console.log(`Port is running on 8000`));
