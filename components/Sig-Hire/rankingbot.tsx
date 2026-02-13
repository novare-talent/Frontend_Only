"use client"

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { IconSend } from "@tabler/icons-react"
import { submitQuery } from "@/lib/ranking-api";

type Message = {
  id: string;
  text: string;
  from: "user" | "bot";
  time?: string;
};

interface RankingBotCardProps {
  className?: string;
  sessionId?: string | null;
  onQuerySubmitted?: () => void;
}

export function RankingBotCard({ className = "", sessionId, onQuerySubmitted }: RankingBotCardProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "Hi, how can I help you today?", from: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // auto-scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (!sessionId) {
      const errorMsg: Message = {
        id: Date.now().toString(),
        text: "⚠️ No active session. Please start by uploading your candidates and job description.",
        from: "bot",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((m) => [...m, errorMsg]);
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      text: trimmed,
      from: "user",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((m) => [...m, userMsg]);
    setInput("");

    // Show processing message
    const processingMsgId = Date.now().toString();
    const processingMsg: Message = {
      id: processingMsgId,
      text: "Processing...",
      from: "bot",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((m) => [...m, processingMsg]);
    setIsProcessing(true);

    // Call the ranking API with the query
    try {
      await submitQuery(sessionId, trimmed);
      
      // Trigger rankings refresh which will fetch updated results
      if (onQuerySubmitted) {
        onQuerySubmitted();
      }
      
      // Replace processing message with success message
      const botMsg: Message = {
        id: processingMsgId,
        text: ` Query processed! Rankings updated based on: ${trimmed}`,
        from: "bot",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((m) => m.map((msg) => (msg.id === processingMsgId ? botMsg : msg)));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to process query";
      // Replace processing message with error message
      const botMsg: Message = {
        id: processingMsgId,
        text: `⚠️ Error: ${errorMessage}`,
        from: "bot",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((m) => m.map((msg) => (msg.id === processingMsgId ? botMsg : msg)));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:h-fit-content *:data-[slot=card]:shadow-s lg:px-6 @xl/main:grid-cols-2 @4xl/main:grid-cols-3">
        <Card className={`@container/card relative overflow-hidden rounded-3xl
  bg-gradient-to-br from-purple-50 via-white to-indigo-50
  border border-purple-100
  shadow-[0_20px_40px_-20px_rgba(124,58,237,0.50)]
  transition-all duration-500
  dark:bg-gradient-to-br dark:from-neutral-900/90 dark:via-neutral-900/70 dark:to-neutral-950
  dark:border-white/10
  dark:shadow-[0_0_80px_-20px_rgba(124,58,237,0.45)]
w-full flex flex-rol ${className}`}>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-primary">Ranking Bot</CardTitle>
            <CardDescription>Use this to find what candidates you&apos;re looking for!</CardDescription>
          </CardHeader>
          {/* Messages area */}
          <div className="px-6 pb-0 h-[30vh] overflow-hidden bg-card border border-primary/30 m-2 rounded-sm">
            <div
              className="h-full bg-transparent rounded-md border border-transparent overflow-y-auto p-3 space-y-3"
              role="log"
              aria-live="polite"
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={
                      m.from === "user"
                        ? "max-w-[80%] bg-primary text-white px-4 py-2 rounded-2xl rounded-br-none shadow-sm"
                        : "max-w-[80%] bg-card px-4 py-2 rounded-2xl rounded-bl-none text-muted-foreground border"
                    }
                  >
                    <div className="whitespace-pre-wrap text-sm">{m.text}</div>
                    <div className="text-[11px] text-muted-foreground mt-1 text-right">
                      {m.time}
                    </div>
                  </div>
                </div>
              ))}
              {/* dummy element to scroll into view */}
              <div ref={messagesEndRef} />
            </div>
          </div>
          {/* Input area */}
          <CardFooter className="px-4 py-3 border-t">
            <div className="w-full flex items-end gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                disabled={isProcessing}
                className="flex-1 min-h-[36px] max-h-28 resize-none rounded-md border border-input border-primary/30 bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Chat message"
              />
              <Button
                variant="default"
                onClick={sendMessage}
                disabled={isProcessing}
                className="ml-auto"
                aria-label="Send message"
              >
                {isProcessing ? "..." : <IconSend className="h-5 w-5" />}
              </Button>
            </div>
          </CardFooter>
        </Card>
    </div>
  );
}
