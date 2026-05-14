"use client";

import { useState, useRef, useEffect } from "react";
import { streamAgent } from "@/lib/api";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { TypingAnimation } from "@workspace/ui/components/typing-animation";
import { ShimmerButton } from "@workspace/ui/components/shimmer-button";
import { Send, User, Bot, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  role: "user" | "assistant";
  content: string;
  status?: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Xin chào! Tôi là Kon AI, trợ lý phân tích kinh doanh của bạn. Tôi có thể phân tích khách hàng, xu hướng doanh thu, rủi ro churn và đề xuất chiến dịch. Tôi có thể giúp gì?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamStatus, setStreamStatus] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, streamStatus]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    setStreamStatus("Đang kết nối...");

    let finalContent = "";

    try {
      await streamAgent(userMessage, (event) => {
        switch (event.type) {
          case "status":
            setStreamStatus(event.content);
            break;
          case "tool_call":
            setStreamStatus(`🔧 ${event.content}`);
            break;
          case "tool_result":
            setStreamStatus("Đang phân tích kết quả...");
            break;
          case "token":
            finalContent = event.content;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant" && last?.status === "streaming") {
                return [...prev.slice(0, -1), { role: "assistant", content: finalContent, status: "streaming" }];
              }
              return [...prev, { role: "assistant", content: finalContent, status: "streaming" }];
            });
            setStreamStatus("");
            break;
          case "error":
            finalContent = `Lỗi: ${event.content}`;
            break;
        }
      });

      if (finalContent) {
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && last?.status === "streaming") {
            return [...prev.slice(0, -1), { role: "assistant", content: finalContent }];
          }
          return [...prev, { role: "assistant", content: finalContent }];
        });
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: "Đã xử lý yêu cầu nhưng không có phản hồi." }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu." }]);
    } finally {
      setIsLoading(false);
      setStreamStatus("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-background/50 backdrop-blur-sm">
      <div 
        className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-muted-foreground/20" 
        ref={scrollRef}
      >
        <div className="space-y-4 max-w-3xl mx-auto">
          <AnimatePresence mode="popLayout">
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ${
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted border"
                }`}>
                  {m.role === "user" ? <User className="size-4" /> : <Bot className="size-4 text-primary" />}
                </div>
                <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                  m.role === "user" 
                    ? "bg-primary text-primary-foreground rounded-tr-none" 
                    : "bg-muted border rounded-tl-none"
                }`}>
                  {m.role === "assistant" && i === messages.length - 1 && isLoading ? (
                    <TypingAnimation duration={50}>Thinking...</TypingAnimation>
                  ) : (
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
...
          {isLoading && streamStatus && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="size-8 rounded-full bg-muted border flex items-center justify-center">
                <Bot className="size-4 text-primary animate-pulse" />
              </div>
              <div className="bg-muted/80 border px-4 py-2 rounded-2xl rounded-tl-none">
                <p className="text-xs text-muted-foreground">{streamStatus}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="p-4 border-t bg-background/80">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Input 
            placeholder="Hỏi Kon AI... (vd: 'Khách hàng nào có nguy cơ rời bỏ cao nhất?')"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 bg-muted/50 focus-visible:ring-primary"
          />
          <ShimmerButton 
            onClick={handleSend} 
            className="h-10 px-4"
            shimmerSize="0.05em"
            borderRadius="0.5rem"
            background="var(--primary)"
          >
            <Send className="size-4 mr-2" />
            Gửi
          </ShimmerButton>
        </div>
        <div className="max-w-3xl mx-auto mt-2 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
           {[
             "Khách hàng nào có nguy cơ rời bỏ cao nhất?",
             "Phân tích xu hướng doanh thu",
             "Đề xuất chiến dịch giữ chân khách hàng có nguy cơ",
             "Tìm khách hàng tương tự: chi tiêu cao nhưng lâu không đặt hàng",
             "Mức độ hài lòng của khách hàng như thế nào?",
             "Đề xuất sản phẩm cho khách hàng CUST_001"
           ].map((suggestion) => (
             <button
                key={suggestion}
                onClick={() => setInput(suggestion)}
                className="text-[10px] px-2 py-1 rounded-full border bg-muted/30 hover:bg-muted transition-colors whitespace-nowrap"
             >
               {suggestion}
             </button>
           ))}
        </div>
      </div>
    </div>
  );
}
