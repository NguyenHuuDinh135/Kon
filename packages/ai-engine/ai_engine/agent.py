"""
Kon AI Agent — Autonomous Business Intelligence Assistant
=========================================================
Uses LangGraph + Gemini to answer business questions with real data.
Has access to 6 specialized tools for e-commerce analytics.
"""
import os
from typing import Annotated, TypedDict, Sequence
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
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
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return None

    model = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash-lite",
        google_api_key=api_key,
        temperature=0.3,
        max_output_tokens=2048
    )

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
        response = model_with_tools.invoke(messages)
        return {"messages": [response]}

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
            if hasattr(msg, "content") and msg.content and not hasattr(msg, "tool_calls"):
                return msg.content
            elif hasattr(msg, "content") and msg.content and hasattr(msg, "tool_calls") and not msg.tool_calls:
                return msg.content

        return "I processed your request but couldn't generate a text response."
    except Exception as e:
        return f"Agent error: {str(e)}"
