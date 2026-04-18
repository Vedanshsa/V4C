import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)

from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from tavily import TavilyClient
from workflow.state import GraphState
from workflow.ingest import load_vectorstore
from workflow.config import (
    OLLAMA_BASE_URL, OLLAMA_MODEL, OLLAMA_TEMPERATURE,
    TAVILY_API_KEY, TAVILY_MAX_RESULTS, TAVILY_SEARCH_DEPTH,
    TAVILY_INCLUDE_ANSWER, TOP_K,
)

llm = ChatOllama(
    model=OLLAMA_MODEL,
    base_url=OLLAMA_BASE_URL,
    temperature=OLLAMA_TEMPERATURE,
)

tavily_client = None
if TAVILY_API_KEY and TAVILY_API_KEY != "paste_your_tavily_key_here":
    tavily_client = TavilyClient(api_key=TAVILY_API_KEY)

_vectorstore = None


def get_vectorstore():
    global _vectorstore
    if _vectorstore is None:
        _vectorstore = load_vectorstore()
    return _vectorstore


def classify_question(state: GraphState) -> GraphState:
    question = state["question"]

    prompt = ChatPromptTemplate.from_messages([
        ("system",
         "You classify questions about Indian tax and compliance.\n"
         "Categories (reply ONLY ONE word):\n"
         "- gst -> GST, goods and services tax, GSTR, input tax credit\n"
         "- income_tax -> income tax, ITR, TDS, 80C, 80D, tax slabs\n"
         "- compliance -> ROC, MCA, company registration, MSME, LLP\n"
         "- greeting -> hi, hello, hey, good morning\n"
         "- general -> anything else\n"
         "Reply with ONLY the category word."),
        ("human", "{question}"),
    ])

    chain = prompt | llm
    result = chain.invoke({"question": question})
    q_type = result.content.strip().lower().strip('"').strip("'")

    valid = ["gst", "income_tax", "compliance", "greeting", "general"]
    if q_type not in valid:
        q_type = "general"

    print(f"   Category: {q_type}")
    return {
        **state,
        "question_type": q_type,
        "web_results": [],
        "web_search_performed": False,
    }


def handle_greeting(state: GraphState) -> GraphState:
    answer = (
        "Hello! I am your Compliance Assistant.\n\n"
        "I can help with:\n"
        "  GST - Registration, returns, rates, ITC\n"
        "  Income Tax - ITR filing, deductions, TDS\n"
        "  Compliance - Company registration, MSME, ROC\n\n"
        "I search your PDF documents first.\n"
        "If not found, I search the web using Tavily.\n\n"
        "Try asking:\n"
        "  -> Do I need GST registration?\n"
        "  -> How to file ITR online?\n"
        "  -> What is MSME registration?\n"
    )
    return {
        **state,
        "answer": answer,
        "documents": [],
        "sources": [],
        "source_type": "greeting",
        "documents_relevant": True,
        "web_results": [],
        "web_search_performed": False,
    }


def retrieve_documents(state: GraphState) -> GraphState:
    question = state["question"]
    print(f"   Searching Qdrant...")

    try:
        vectorstore = get_vectorstore()
        docs_with_scores = vectorstore.similarity_search_with_score(question, k=TOP_K)

        docs = []
        sources = []

        for doc, score in docs_with_scores:
            docs.append(doc)
            sf = doc.metadata.get("source_file", "Unknown")
            pg = doc.metadata.get("page", 0)
            src = f"{sf} (Page {int(pg) + 1})"
            if src not in sources:
                sources.append(src)
            print(f"   Score: {score:.4f} | {sf} p.{int(pg) + 1}")

        print(f"   Found {len(docs)} chunks")
        return {**state, "documents": docs, "sources": sources}

    except Exception as e:
        print(f"   Qdrant search error: {e}")
        return {**state, "documents": [], "sources": []}


def check_relevance(state: GraphState) -> GraphState:
    docs = state["documents"]
    question = state["question"]

    if not docs:
        print("   No documents found")
        return {**state, "documents_relevant": False}

    doc_preview = "\n---\n".join([d.page_content[:400] for d in docs[:3]])

    prompt = ChatPromptTemplate.from_messages([
        ("system", "Check if documents are relevant to the question. Reply ONLY yes or no."),
        ("human", "Question: {question}\n\nDocuments:\n{docs}\n\nRelevant?"),
    ])

    chain = prompt | llm
    result = chain.invoke({"question": question, "docs": doc_preview})

    is_relevant = "yes" in result.content.strip().lower()
    print(f"   Documents relevant: {is_relevant}")
    return {**state, "documents_relevant": is_relevant}


def generate_answer_from_pdf(state: GraphState) -> GraphState:
    question = state["question"]
    docs = state["documents"]
    chat_history = state.get("chat_history", [])

    context = "\n\n---\n\n".join([
        f"[Source: {d.metadata.get('source_file', '?')} | "
        f"Page: {int(d.metadata.get('page', 0)) + 1}]\n{d.page_content}"
        for d in docs
    ])

    history_str = ""
    if chat_history:
        for msg in chat_history[-6:]:
            role = "User" if msg["role"] == "user" else "Assistant"
            history_str += f"{role}: {msg['content']}\n"

    prompt = ChatPromptTemplate.from_messages([
        ("system",
         "You are an expert Indian Compliance Assistant.\n"
         "RULES:\n"
         "1. Answer ONLY from provided context\n"
         "2. If context is insufficient, say so\n"
         "3. Use bullet points for lists\n"
         "4. Cite source file and page\n"
         "5. Simple language for business owners\n"
         "6. Be precise with thresholds and limits"),
        ("human", "HISTORY:\n{history}\n\nCONTEXT:\n{context}\n\nQUESTION: {question}\n\nAnswer:"),
    ])

    chain = prompt | llm
    result = chain.invoke({
        "history": history_str or "None",
        "context": context,
        "question": question,
    })

    answer = result.content
    answer += "\n\nSource: PDF Documents"
    if state.get("sources"):
        answer += "\nReferences:"
        for src in state["sources"]:
            answer += f"\n  - {src}"

    return {**state, "answer": answer, "source_type": "pdf"}


def search_web(state: GraphState) -> GraphState:
    question = state["question"]
    q_type = state.get("question_type", "general")

    print(f"\n   Documents insufficient - Searching web...")

    if not tavily_client:
        print("   Tavily not configured")
        return {**state, "web_results": [], "web_search_performed": False}

    search_query = question
    if q_type == "gst":
        search_query = f"India GST {question}"
    elif q_type == "income_tax":
        search_query = f"India income tax {question}"
    elif q_type == "compliance":
        search_query = f"India business compliance {question}"

    print(f"   Web query: {search_query[:60]}...")

    try:
        response = tavily_client.search(
            query=search_query,
            max_results=TAVILY_MAX_RESULTS,
            search_depth=TAVILY_SEARCH_DEPTH,
            include_answer=TAVILY_INCLUDE_ANSWER,
        )

        web_results = []
        sources = []

        tavily_answer = response.get("answer", "")

        for r in response.get("results", []):
            web_results.append({
                "title": r.get("title", ""),
                "url": r.get("url", ""),
                "content": r.get("content", ""),
                "score": r.get("score", 0),
            })
            src = f"Web: {r.get('title', 'Web')} ({r.get('url', '')})"
            sources.append(src)
            print(f"   Web: {r.get('title', '')[:50]}...")

        if tavily_answer:
            web_results.insert(0, {
                "title": "Tavily AI Answer",
                "url": "",
                "content": tavily_answer,
                "score": 1.0,
            })

        print(f"   Found {len(web_results)} web results")

        return {
            **state,
            "web_results": web_results,
            "web_search_performed": True,
            "sources": sources,
        }

    except Exception as e:
        print(f"   Web search error: {e}")
        return {**state, "web_results": [], "web_search_performed": True}


def generate_answer_from_web(state: GraphState) -> GraphState:
    question = state["question"]
    web_results = state.get("web_results", [])
    chat_history = state.get("chat_history", [])

    if not web_results:
        return generate_fallback(state)

    web_context = ""
    for i, r in enumerate(web_results, 1):
        web_context += (
            f"\n[Result {i}]\n"
            f"Title: {r['title']}\n"
            f"URL: {r['url']}\n"
            f"Content: {r['content']}\n---\n"
        )

    history_str = ""
    if chat_history:
        for msg in chat_history[-6:]:
            role = "User" if msg["role"] == "user" else "Assistant"
            history_str += f"{role}: {msg['content']}\n"

    prompt = ChatPromptTemplate.from_messages([
        ("system",
         "You are an expert Indian Compliance Assistant.\n"
         "Answering using WEB SEARCH results.\n"
         "RULES:\n"
         "1. Synthesize info from web results\n"
         "2. Prioritize official government sources\n"
         "3. Use bullet points for clarity\n"
         "4. Include URLs for reference\n"
         "5. Mention this is from web search\n"
         "6. Add disclaimer to verify with professional"),
        ("human", "HISTORY:\n{history}\n\nWEB RESULTS:\n{web_context}\n\nQUESTION: {question}\n\nAnswer:"),
    ])

    chain = prompt | llm
    result = chain.invoke({
        "history": history_str or "None",
        "web_context": web_context,
        "question": question,
    })

    answer = "WEB SEARCH RESULT:\n\n" + result.content

    if state.get("sources"):
        answer += "\n\nWeb Sources:"
        for src in state["sources"][:5]:
            answer += f"\n  - {src}"

    answer += "\n\nNote: This answer is from web search. Please verify with official sources."

    return {**state, "answer": answer, "source_type": "web"}


def generate_fallback(state: GraphState) -> GraphState:
    question = state["question"]
    q_type = state.get("question_type", "general")
    web_searched = state.get("web_search_performed", False)

    prompt = ChatPromptTemplate.from_messages([
        ("system",
         "You are a helpful Indian Compliance Assistant.\n"
         "No relevant info found in documents or web.\n"
         "Be honest. Give general guidance if confident.\n"
         "Recommend consulting a professional."),
        ("human", "Category: {category}\nWeb searched: {web_searched}\nQuestion: {question}\n\nResponse:"),
    ])

    chain = prompt | llm
    result = chain.invoke({
        "category": q_type,
        "web_searched": str(web_searched),
        "question": question,
    })

    answer = (
        "No specific information found.\n\n"
        + result.content
        + "\n\nTips:\n"
        "  - Add more PDFs to pdfs/ folder\n"
        "  - Run python ingest.py to update\n"
        "  - Try rephrasing your question"
    )

    return {**state, "answer": answer, "sources": [], "source_type": "fallback"}