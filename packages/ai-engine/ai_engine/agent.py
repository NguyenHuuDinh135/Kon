"""
Kon AI Agent — Autonomous Business Intelligence Assistant
=========================================================
Uses LangGraph + AWS Bedrock (Claude Haiku) as primary LLM with Ollama fallback.
Has access to 7 specialized tools for e-commerce analytics.
"""
import os
from typing import Annotated, TypedDict, Sequence
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


def _create_bedrock_model():
    """Attempt to create a Bedrock model. Returns the model or raises on failure."""
    from langchain_aws import ChatBedrockConverse

    region = os.getenv("AWS_REGION", "us-west-2")
    model_id = os.getenv("BEDROCK_MODEL_ID", "us.anthropic.claude-haiku-4-5-20251001")

    model = ChatBedrockConverse(
        model=model_id,
        region_name=region,
        temperature=0.3,
        max_tokens=2048,
    )
    return model, model_id, region


def _create_ollama_model():
    """Create an Ollama model instance."""
    ollama_url = os.getenv("OLLAMA_BASE_URL", "http://host.docker.internal:11434")
    model_name = os.getenv("OLLAMA_LLM_MODEL", "qwen2.5")

    model = ChatOllama(
        model=model_name,
        base_url=ollama_url,
        temperature=0.1,
    )
    return model, model_name, ollama_url


def create_agent():
    """Create the LangGraph agent with tools."""
    use_bedrock = os.getenv("USE_BEDROCK", "true").lower() == "true"

    primary_model = None
    fallback_model = None
    fallback_model_with_tools = None

    if use_bedrock:
        try:
            model, model_id, region = _create_bedrock_model()
            primary_model = model
            print(f"AI Agent: Initialized with AWS Bedrock ({model_id}) in {region}")
        except Exception as e:
            print(f"AI Agent: Bedrock initialization failed ({e}), falling back to Ollama")
            primary_model = None

    if primary_model is None:
        # Either USE_BEDROCK=false or Bedrock init failed — use Ollama as primary
        try:
            model, model_name, ollama_url = _create_ollama_model()
            primary_model = model
            print(f"AI Agent: Initialized with Ollama ({model_name}) at {ollama_url}")
        except Exception as e:
            print(f"AI Agent: Ollama initialization also failed ({e})")
            return None

    # Always prepare Ollama as fallback when Bedrock is primary
    if use_bedrock:
        try:
            fb_model, fb_name, fb_url = _create_ollama_model()
            fallback_model = fb_model
            print(f"AI Agent: Ollama fallback ready ({fb_name}) at {fb_url}")
        except Exception:
            print("AI Agent: Ollama fallback unavailable")
            fallback_model = None

    tools = [
        query_database,
        get_customer_profile,
        get_churn_risk_summary,
        get_product_recommendations,
        get_revenue_insights,
        suggest_campaign,
        search_similar_customers
    ]

    model_with_tools = primary_model.bind_tools(tools)
    if fallback_model is not None:
        fallback_model_with_tools = fallback_model.bind_tools(tools)

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
            # If primary (Bedrock) fails, try fallback (Ollama)
            if fallback_model_with_tools is not None:
                try:
                    print(f"AI Agent: Primary model failed ({e}), retrying with Ollama fallback")
                    response = fallback_model_with_tools.invoke(messages)
                    return {"messages": [response]}
                except Exception as fallback_err:
                    error_msg = f"Both primary and fallback models failed. Primary: {e} | Fallback: {fallback_err}"
                    return {"messages": [HumanMessage(content=f"I encountered an error: {error_msg}")]}

            # No fallback available
            error_msg = f"Agent error details: {str(e)}"
            ollama_model_name = os.getenv("OLLAMA_LLM_MODEL", "qwen2.5")
            if "404" in str(e):
                error_msg = (
                    f"Model not found. Please verify the model is available. "
                    f"For Ollama, run 'ollama pull {ollama_model_name}' on your host machine."
                )

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
        return "AI Agent unavailable — no LLM configured (Bedrock and Ollama both failed)."

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
