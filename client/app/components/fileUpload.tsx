"use client";

import { Upload } from "lucide-react";
import React from "react";

const FileUpload: React.FC = () => {
  const handleFileUpload = () => {
    const el = document.createElement("input");
    el.setAttribute("type", "file");
    el.setAttribute("accept", "application/pdf");
    el.addEventListener("change", (e) => {
      if (el.files && el.files.length > 0) {
        const file = el.files.item(0);
      }
    });
    el.click();
  };

  return (
    <>
      <div
        onClick={handleFileUpload}
        className="flex flex-col p-3 bg-blue-500 rounded-lg items-center justify-center w-[50%]"
      >
        <h3 className="pb-2">Upload PDF</h3>
        <Upload />
      </div>
    </>
  );
};

export default FileUpload;
