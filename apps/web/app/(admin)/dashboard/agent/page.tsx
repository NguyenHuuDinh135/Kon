import { ChatInterface } from "@/components/agent/chat-interface";

export default function AgentPage() {
  return (
    <div className="flex flex-col h-full space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-primary">Kon AI Agent</h2>
        <p className="text-muted-foreground">
          Autonomous ERP specialist. I can analyze sales, predict churn, and perform complex SQL queries.
        </p>
      </div>

      <div className="flex-1 min-h-[500px] border rounded-xl overflow-hidden bg-muted/30">
        <ChatInterface />
      </div>
    </div>
  );
}
