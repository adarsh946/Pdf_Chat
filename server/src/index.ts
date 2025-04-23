import express from "express";
import cors from "cors";
import multer from "multer";
import { Queue } from "bullmq";

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

app.listen(8000, () => console.log(`Port is running on 8000`));
