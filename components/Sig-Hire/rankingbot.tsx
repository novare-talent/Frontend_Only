"use client";

import { useEffect, useRef, useState } from "react";
import { IconSend } from "@tabler/icons-react";
import { submitQuery } from "@/lib/ranking-api";
import ChromeButton from "@/components/Sig-Hire/ChromeButton";

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

export function RankingBotCard({
  className = "",
  sessionId,
  onQuerySubmitted,
}: RankingBotCardProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "Hi, how can I help you today?", from: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messageIdCounterRef = useRef<number>(2);

  // auto-scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (!sessionId) {
      const errorMsg: Message = {
        id: (messageIdCounterRef.current++).toString(),
        text: "⚠️ No active session. Please start by uploading your candidates and job description.",
        from: "bot",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((m) => [...m, errorMsg]);
      return;
    }

    const userMsg: Message = {
      id: (messageIdCounterRef.current++).toString(),
      text: trimmed,
      from: "user",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((m) => [...m, userMsg]);
    setInput("");

    // Show processing message
    const processingMsgId = (messageIdCounterRef.current++).toString();
    const processingMsg: Message = {
      id: processingMsgId,
      text: "Processing...",
      from: "bot",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
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
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((m) =>
        m.map((msg) => (msg.id === processingMsgId ? botMsg : msg)),
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to process query";
      // Replace processing message with error message
      const botMsg: Message = {
        id: processingMsgId,
        text: `⚠️ Error: ${errorMessage}`,
        from: "bot",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((m) =>
        m.map((msg) => (msg.id === processingMsgId ? botMsg : msg)),
      );
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
    <div className="relative overflow-hidden rounded-md border border-glass-border bg-glass-bg backdrop-blur-xl transition-all duration-300 h-full flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-lavender)]/10 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative z-10 p-6 pb-4 flex items-center gap-3 border-b border-white/5 flex-shrink-0">
        <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0" style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)" }}>
          <IconSend className="w-4 h-4" style={{ color: "var(--color-lavender)" }} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white leading-tight">Ranking Bot</h3>
          <p className="text-xs text-white/40 mt-0.5">Use this to find what candidates you&apos;re looking for!</p>
        </div>
      </div>

      {/* Messages area */}
      <div className="relative z-10 px-6 pt-4 pb-0 flex-1 overflow-hidden">
        <div
          className="h-full rounded-lg overflow-y-auto p-3 space-y-3"
          style={{
            background: "rgba(0,0,0,0.25)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
          role="log"
          aria-live="polite"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-md shadow-sm ${
                  m.from === "user"
                    ? "rounded-br-none"
                    : "rounded-bl-none"
                }`}
                style={{
                  background: m.from === "user" ? "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)" : "rgba(255,255,255,0.05)",
                  border: m.from === "user" ? "1px solid rgba(124,58,237,0.3)" : "1px solid rgba(255,255,255,0.1)",
                  color: "white"
                }}
              >
                <div className="whitespace-pre-wrap text-sm">{m.text}</div>
                <div className="text-[11px] mt-1 text-right" style={{ color: "rgba(255,255,255,0.5)" }}>
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
      <div className="relative z-10 px-6 py-4 border-t border-white/5 flex-shrink-0">
        <div className="w-full flex items-center gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={isProcessing}
            className="flex-1 min-h-[40px] max-h-28 resize-none rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/25 outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "rgba(0,0,0,0.25)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = "rgba(124,58,237,0.5)"}
            onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}
            aria-label="Chat message"
          />
          <ChromeButton
            onClick={sendMessage}
            disabled={isProcessing}
            className="flex-shrink-0"
            aria-label="Send message"
          >
            {isProcessing ? "..." : <IconSend className="h-5 w-5" />}
          </ChromeButton>
        </div>
      </div>
    </div>
  );
}
