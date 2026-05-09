"use client";

import { useState, useRef, useEffect } from "react";
import { runAgent } from "@/lib/api";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { TypingAnimation } from "@workspace/ui/components/typing-animation";
import { ShimmerButton } from "@workspace/ui/components/shimmer-button";
import { Send, User, Bot, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I am Kon AI, your business intelligence assistant. I can analyze customers, revenue trends, churn risks, and suggest campaigns. How can I help?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await runAgent(userMessage);
      // Backend returns { result: [...] } or { result: "string" }
      let content = "Agent processed the request.";
      if (typeof response.result === "string") {
        content = response.result;
      } else if (Array.isArray(response.result)) {
        content = response.result.map((r: any) => r.text).join("\n");
      }
      
      setMessages(prev => [...prev, { role: "assistant", content }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error processing your request." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background/50 backdrop-blur-sm">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
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
                    : "bg-muted/80 border rounded-tl-none"
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
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="size-8 rounded-full bg-muted border flex items-center justify-center">
                <Bot className="size-4 text-primary animate-pulse" />
              </div>
              <div className="bg-muted/80 border px-4 py-2 rounded-2xl rounded-tl-none">
                <div className="flex gap-1 h-4 items-center">
                  <div className="size-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <div className="size-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="size-1.5 bg-primary/80 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-background/80">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Input 
            placeholder="Ask Kon AI... (e.g., 'Who are our highest churn risk customers?')"
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
            Send
          </ShimmerButton>
        </div>
        <div className="max-w-3xl mx-auto mt-2 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
           {[
             "Who are our highest churn risk customers?",
             "Show me revenue insights and trends",
             "Suggest a retention campaign for at-risk customers",
             "Find customers similar to: high spenders who haven't ordered recently",
             "What's our customer satisfaction looking like?",
             "Recommend products for customer CUST_001"
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
