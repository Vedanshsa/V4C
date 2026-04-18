from langgraph.graph import StateGraph, END
from workflow.state import GraphState
from workflow.nodes import (
    classify_question,
    handle_greeting,
    retrieve_documents,
    check_relevance,
    generate_answer_from_pdf,
    search_web,
    generate_answer_from_web,
    generate_fallback,
)


def route_after_classify(state: GraphState) -> str:
    if state.get("question_type") == "greeting":
        return "greeting"
    return "retrieve"


def route_after_relevance(state: GraphState) -> str:
    if state.get("documents_relevant", False):
        return "pdf_answer"
    return "web_search"


def route_after_web_search(state: GraphState) -> str:
    web_results = state.get("web_results", [])
    if web_results and len(web_results) > 0:
        return "web_answer"
    return "fallback"


def build_graph():
    workflow = StateGraph(GraphState)

    workflow.add_node("classify", classify_question)
    workflow.add_node("greeting", handle_greeting)
    workflow.add_node("retrieve", retrieve_documents)
    workflow.add_node("check_relevance", check_relevance)
    workflow.add_node("pdf_answer", generate_answer_from_pdf)
    workflow.add_node("web_search", search_web)
    workflow.add_node("web_answer", generate_answer_from_web)
    workflow.add_node("fallback", generate_fallback)

    workflow.set_entry_point("classify")

    workflow.add_conditional_edges(
        "classify",
        route_after_classify,
        {"greeting": "greeting", "retrieve": "retrieve"},
    )

    workflow.add_edge("greeting", END)
    workflow.add_edge("retrieve", "check_relevance")

    workflow.add_conditional_edges(
        "check_relevance",
        route_after_relevance,
        {"pdf_answer": "pdf_answer", "web_search": "web_search"},
    )

    workflow.add_edge("pdf_answer", END)

    workflow.add_conditional_edges(
        "web_search",
        route_after_web_search,
        {"web_answer": "web_answer", "fallback": "fallback"},
    )

    workflow.add_edge("web_answer", END)
    workflow.add_edge("fallback", END)

    app = workflow.compile()
    return app


graph_app = build_graph()
