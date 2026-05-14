"""
Kon AI Agent — Autonomous Business Intelligence Assistant
=========================================================
Uses LangGraph + Gemini to answer business questions with real data.
Has access to 6 specialized tools for e-commerce analytics.
"""
import os
from typing import Annotated, TypedDict, Sequence
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_ollama import ChatOllama
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage, ToolMessage
from mcp_servers.tools import (
    query_database,
    get_customer_profile,
    get_churn_risk_summary,
    get_product_recommendations,
    get_revenue_insights,
    suggest_campaign,
    search_similar_customers
)

SYSTEM_PROMPT = """You are Kon AI, an autonomous ERP/CRM intelligence assistant for an e-commerce business.
IMPORTANT: Always respond in Vietnamese. Never use Chinese characters.

## Your Knowledge Base
- 100K+ orders from Brazilian e-commerce (Olist dataset)
- 541K transaction records from Online Retail
- 5,630 customer profiles with real churn predictions (ML-powered)
- Customer segmentation into 5 RFM clusters (VIP, Loyal, Regular, At Risk, Lost)
- Revenue forecasting and trend analysis

## Your Capabilities
1. **Customer Analysis**: Profile any customer, assess churn risk, find similar customers
2. **Revenue Intelligence**: Trends, top categories, forecasting, period comparisons
3. **Recommendations**: Product suggestions based on collaborative filtering
4. **Campaign Strategy**: Suggest targeted campaigns based on segment analysis
5. **Churn Prevention**: Identify at-risk customers, suggest retention actions
6. **Semantic Search**: Find customers matching natural language descriptions

## Guidelines
- Always back your answers with data (use tools to query real numbers)
- Be specific and actionable — not generic advice
- When suggesting campaigns, include: target segment, discount %, channel, expected impact
- For churn analysis, always mention the probability and contributing factors
- Format responses clearly with bullet points for readability
- If you don't have enough data, say so honestly

## Response Format
Structure your responses as:
1. Direct answer to the question
2. Supporting data points
3. Recommended next actions (if applicable)
"""


class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], lambda x, y: x + y]


def create_agent():
    """Create the LangGraph agent with tools."""
    use_local = os.getenv("USE_LOCAL_LLM", "false").lower() == "true"
    api_key = os.getenv("GOOGLE_API_KEY")

    if use_local:
        # Use local Ollama instance
        # For tool calling, we recommend models like qwen2.5:7b or llama3.1
        ollama_url = os.getenv("OLLAMA_BASE_URL", "http://host.docker.internal:11434")
        model_name = os.getenv("LOCAL_LLM_MODEL", "qwen2.5")
        
        model = ChatOllama(
            model=model_name,
            base_url=ollama_url,
            temperature=0.1,
        )
        print(f"AI Agent: Initialized with LOCAL LLM ({model_name}) via Ollama at {ollama_url}")
    else:
        if not api_key:
            return None

        # Use gemini-flash-latest which points to the most stable flash model (1.5 or 2.0)
        model = ChatGoogleGenerativeAI(
            model="gemini-flash-latest",
            google_api_key=api_key,
            temperature=0.3,
            max_output_tokens=2048
        )
        print("AI Agent: Initialized with Google Gemini (Cloud)")

    tools = [
        query_database,
        get_customer_profile,
        get_churn_risk_summary,
        get_product_recommendations,
        get_revenue_insights,
        suggest_campaign,
        search_similar_customers
    ]

    model_with_tools = model.bind_tools(tools)
    tool_node = ToolNode(tools)

    def should_continue(state: AgentState):
        last_message = state["messages"][-1]
        if hasattr(last_message, "tool_calls") and last_message.tool_calls:
            return "tools"
        return END

    def call_model(state: AgentState):
        messages = [SystemMessage(content=SYSTEM_PROMPT)] + list(state["messages"])
        try:
            response = model_with_tools.invoke(messages)
            return {"messages": [response]}
        except Exception as e:
            if not use_local and ("429" in str(e) or "quota" in str(e).lower()):
                # Fallback mock response for demo stability when quota is exceeded
                mock_msg = HumanMessage(content="[DEMO MODE] The Gemini API quota is currently exceeded. In a production environment with billing enabled, I would now analyze the data and provide a detailed answer. Please check your Google Cloud Console for quota details.")
                return {"messages": [mock_msg]}
            
            error_msg = f"Agent error details: {str(e)}"
            if use_local and "404" in str(e):
                error_msg = f"Local model '{os.getenv('LOCAL_LLM_MODEL', 'qwen2.5')}' not found. Please run 'ollama pull {os.getenv('LOCAL_LLM_MODEL', 'qwen2.5')}' on your host machine."
            
            return {"messages": [HumanMessage(content=f"I encountered an error: {error_msg}")]}

    workflow = StateGraph(AgentState)
    workflow.add_node("agent", call_model)
    workflow.add_node("tools", tool_node)
    workflow.set_entry_point("agent")
    workflow.add_conditional_edges("agent", should_continue, {"tools": "tools", END: END})
    workflow.add_edge("tools", "agent")

    return workflow.compile()


# Module-level agent instance
_agent = None

def get_agent():
    global _agent
    if _agent is None:
        _agent = create_agent()
    return _agent


def run_agent(prompt: str) -> str:
    """Run the AI agent with a user prompt and return the response."""
    agent = get_agent()
    if agent is None:
        return "AI Agent unavailable — GOOGLE_API_KEY not configured."

    try:
        result = agent.invoke({
            "messages": [HumanMessage(content=prompt)]
        })

        # Extract the final text response
        messages = result.get("messages", [])
        for msg in reversed(messages):
            if isinstance(msg, AIMessage) and msg.content:
                return msg.content
        for msg in reversed(messages):
            if isinstance(msg, ToolMessage) and msg.content:
                return f"Based on my analysis:\n\n{msg.content}"

        return "I processed your request but couldn't generate a summary."
    except Exception as e:
        return f"Agent error: {str(e)}"


def stream_agent(prompt: str):
    """Stream the AI agent execution, yielding events for each step."""
    agent = get_agent()
    if agent is None:
        yield {"type": "error", "content": "AI Agent unavailable — no LLM configured."}
        return

    try:
        yield {"type": "status", "content": "Đang suy nghĩ..."}

        for event in agent.stream({"messages": [HumanMessage(content=prompt)]}):
            if "agent" in event:
                msg = event["agent"]["messages"][-1]
                if isinstance(msg, AIMessage):
                    if msg.tool_calls:
                        tool_names = [tc["name"] for tc in msg.tool_calls]
                        yield {"type": "tool_call", "content": f"Đang truy vấn: {', '.join(tool_names)}"}
                    elif msg.content:
                        yield {"type": "token", "content": msg.content}
            elif "tools" in event:
                msg = event["tools"]["messages"][-1]
                if isinstance(msg, ToolMessage):
                    content_preview = str(msg.content)[:200]
                    yield {"type": "tool_result", "content": content_preview}

    except Exception as e:
        yield {"type": "error", "content": f"Agent error: {str(e)}"}
