import os
import sys
from typing import TypedDict, Annotated, Sequence, Union
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END, add_messages
from langgraph.prebuilt import ToolNode
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, ToolMessage

# Add project root to sys.path to find local packages
sys.path.append(os.path.join(os.path.dirname(__file__), "../../mcp-servers"))
from mcp_servers.tools import (
    northwind_query_tool, 
    get_customer_orders, 
    analyze_customer_behavior,
    behavior_vector_search
)

# Define the tools
tools = [
    northwind_query_tool, 
    get_customer_orders, 
    analyze_customer_behavior,
    behavior_vector_search
]
tool_node = ToolNode(tools)

# Initialize the model
llm = ChatGoogleGenerativeAI(
    model="gemini-3.1-flash-lite-preview",
    google_api_key=os.getenv("GOOGLE_API_KEY")
) 
llm_with_tools = llm.bind_tools(tools)

class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]

def call_model(state: AgentState):
    print("--- CALLING MODEL ---")
    messages = state["messages"]
    response = llm_with_tools.invoke(messages)
    return {"messages": [response]}

def should_continue(state: AgentState):
    last_message = state["messages"][-1]
    if last_message.tool_calls:
        return "tools"
    return END

# Build the graph
workflow = StateGraph(AgentState)

workflow.add_node("agent", call_model)
workflow.add_node("tools", tool_node)

workflow.set_entry_point("agent")
workflow.add_conditional_edges("agent", should_continue)
workflow.add_edge("tools", "agent")

app = workflow.compile()

def run_agent(input_text: str):
    print(f"Running agent with input: {input_text}")
    inputs = {"messages": [HumanMessage(content=input_text)]}
    final_output = ""
    
    for output in app.stream(inputs):
        for key, value in output.items():
            print(f"Output from node '{key}': {value}")
            if key == "agent":
                last_msg = value["messages"][-1]
                if isinstance(last_msg, AIMessage) and not last_msg.tool_calls:
                    final_output = last_msg.content
    
    return final_output if final_output else "Agent processed the request."
