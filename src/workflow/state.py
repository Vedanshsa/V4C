from typing import TypedDict, List, Optional
from langchain_core.documents import Document


class GraphState(TypedDict):
    question: str
    chat_history: List[dict]
    question_type: str
    documents: List[Document]
    documents_relevant: bool
    web_results: List[dict]
    web_search_performed: bool
    answer: str
    sources: List[str]
    source_type: str
    error: Optional[str]
