// import React from "react";
// import { Input } from "@/components/ui/input";

// const ChatInterface: React.FC = () => {
//   return (
//     <div className=" p-4 bottom-6">
//       <Input type="text" placeholder="Enter your Question....." />
//     </div>
//   );
// };

// export default ChatInterface;

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";

// interface Doc {
//   pageContent?: string;
//   metdata?: {
//     loc?: {
//       pageNumber?: number;
//     };
//     source?: string;
//   };
// }
interface IMessage {
  role: "assistant" | "user";
  content?: string;
  // documents?: Doc[];
}

export default function Home() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // const userMessage = { sender: "user", text: input };
    // setMessages((prev) => [...prev, userMessage]);
    // setInput("");
    // setLoading(true);

    setMessages((prev) => [...prev, { role: "user", content: input }]);

    // simulate API call
    const response = await fetch(
      `http://localhost:8000/chat-pdf?message=${input}`
    );
    const data = await response.json();
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: data?.message },
    ]);

    // const aiMessage = { sender: "ai", text: data.reply };
    // setMessages((prev) => [...prev, aiMessage]);
    // setLoading(false);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen p-4">
      {/* Chat area */}
      <div className="flex-1 overflow-y-auto mb-4 ">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-2 ${
              m.role === "user" ? "text-right" : "text-left max-w-[70%]"
            }`}
          >
            <div
              className={`inline-block px-4 py-2 rounded-lg ${
                m.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-black"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-left mb-2">
            <div className="inline-block px-4 py-2 rounded-lg bg-gray-300 text-black animate-pulse">
              Typing...
            </div>
          </div>
        )}
        <div ref={bottomRef}></div>
      </div>

      {/* Input area */}
      <div className="flex">
        <Input
          type="text"
          className="flex-1 border rounded-l-lg p-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your message..."
        />
        <Button
          variant={"outline"}
          className="bg-blue-500 text-white px-4 rounded-r-lg"
          onClick={sendMessage}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
