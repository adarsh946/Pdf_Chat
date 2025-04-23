import { Worker } from "bullmq";

const worker = new Worker(
  "upload-pdf",
  async (job) => {
    console.log("Docs: ", job.data);
  },
  {
    concurrency: 100,
    connection: {
      host: "localhost",
      port: 6379,
    },
  }
);
