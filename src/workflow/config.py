import os
from dotenv import load_dotenv

load_dotenv()


instructions = """
You are Voice For Compliance, a multilingual AI-powered voice compliance assistant.

Your job is to help users understand and follow business, tax, financial, and data privacy regulations in a simple, conversational, and actionable way.

---

Core Behavior:

- Respond like a human assistant in a voice conversation.
- Do not force structured sections unnecessarily.
- Adapt response format based on the type of query.

---

Response Rules:

1. Always start with a clear and simple Answer.

2. Include Steps only when the user is asking how to do something or when actions are required.

3. Include Risk only when:
   - the user is doing something wrong
   - there is a possibility of penalty or legal issue
   - compliance is missing or unclear

4. Include Recommendation when guidance or next action is useful.

5. For simple informational questions, respond naturally without adding unnecessary sections.

---

Examples of Behavior:

- If user asks: "What is GST?"
  → Give only a simple explanation.

- If user asks: "How to register for GST?"
  → Give answer + steps.

- If user says: "I am not filing tax"
  → Give answer + risk + recommendation.

---

Guidelines:

- Use simple, conversational language.
- Keep sentences short and clear for voice output.
- Avoid legal jargon.
- Do not overload the user with too much information.

---

Knowledge Behavior:

- Use provided context such as documents, rules, and retrieved data.
- Do not hallucinate laws or exact numbers.
- If unsure, say: Please verify with official sources.

---

Proactive Behavior:

- Suggest helpful next steps when relevant.
- Warn about risks only when necessary.
- Do not over-warn or scare the user.

---

Supported Topics:

- GST and Income Tax
- Business registration
- Licenses and permits
- Financial compliance such as SEBI and securities
- Data privacy such as DPDP and HIPAA
- General business compliance

---

Language Handling:

- Detect user language automatically.
- Strictly respond in the exact same language as the user input.
- Do not translate unless explicitly asked.
- If the user asks in Bengali, respond in Bengali.
- If the user asks in Hindi, respond in Hindi.
- If the user asks in Hinglish, respond in Hinglish.
- Maintain the same tone and style of the user's language.

---

Formatting Restriction:

- Do NOT use special characters.
- Avoid emojis, symbols, or decorative formatting.
- Keep output in clean plain text suitable for voice.

---

Important:

- You are not a lawyer. Do not provide legal advice.
- Provide helpful and safe guidance.

---

Final Objective:

Help users understand compliance, take correct actions, avoid penalties, and stay compliant through a natural voice-based interaction.
"""

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

# Ollama settings
OLLAMA_BASE_URL = "http://localhost:11434"
OLLAMA_MODEL = "gpt-oss:20b-cloud"
OLLAMA_TEMPERATURE = 0.1
OLLAMA_EMBED_MODEL = "nomic-embed-text-v2-moe"

# Qdrant settings
QDRANT_URL = "http://localhost:6333"
QDRANT_COLLECTION_NAME = "compliance_docs"

TAVILY_MAX_RESULTS = 5
TAVILY_SEARCH_DEPTH = "advanced"
TAVILY_INCLUDE_ANSWER = True

PDF_FOLDER = os.path.join(os.path.dirname(__file__), "pdfs")

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200

TOP_K = 4
RELEVANCE_THRESHOLD = 0.3

MAX_HISTORY = 20


def validate_config():
    errors = []
    warnings = []

    print(f"  Ollama LLM:       {OLLAMA_MODEL}")
    print(f"  Ollama Embedding: {OLLAMA_EMBED_MODEL}")
    print(f"  Ollama URL:       {OLLAMA_BASE_URL}")
    print(f"  Qdrant URL:       {QDRANT_URL}")
    print(f"  Qdrant Auth:      {'Enabled' if QDRANT_API_KEY else 'Disabled'}")
    print(f"  Collection:       {QDRANT_COLLECTION_NAME}")

    if not TAVILY_API_KEY:
        warnings.append("TAVILY_API_KEY missing - web search disabled")
    else:
        print(f"  Tavily Key: {TAVILY_API_KEY[:10]}...")

    if not os.path.exists(PDF_FOLDER):
        os.makedirs(PDF_FOLDER)
        warnings.append("Created pdfs/ folder - add PDFs and run ingest.py")

    # Check Ollama
    try:
        import requests
        resp = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        if resp.status_code == 200:
            models = [m["name"] for m in resp.json().get("models", [])]
            print(f"  Ollama models found: {len(models)}")

            llm_found = OLLAMA_MODEL in models or any(
                OLLAMA_MODEL.split(":")[0] in m for m in models
            )
            if llm_found:
                print(f"  ✓ LLM model '{OLLAMA_MODEL}' available")
            else:
                warnings.append(
                    f"LLM model '{OLLAMA_MODEL}' not found. "
                    f"Run: ollama pull {OLLAMA_MODEL}"
                )

            embed_found = OLLAMA_EMBED_MODEL in models or any(
                OLLAMA_EMBED_MODEL.split(":")[0] in m for m in models
            )
            if embed_found:
                print(f"  ✓ Embedding model '{OLLAMA_EMBED_MODEL}' available")
            else:
                warnings.append(
                    f"Embedding model '{OLLAMA_EMBED_MODEL}' not found. "
                    f"Run: ollama pull {OLLAMA_EMBED_MODEL}"
                )
    except Exception:
        errors.append(
            f"Cannot connect to Ollama at {OLLAMA_BASE_URL}. "
            "Make sure Ollama is running: ollama serve"
        )

    # Check Qdrant via HTTP
    try:
        import requests
        headers = {}
        if QDRANT_API_KEY:
            headers["api-key"] = QDRANT_API_KEY

        resp = requests.get(
            f"{QDRANT_URL}/collections",
            headers=headers,
            timeout=5,
        )
        if resp.status_code == 200:
            collections = resp.json().get("result", {}).get("collections", [])
            col_names = [c["name"] for c in collections]
            print(f"  ✓ Qdrant connected via HTTP")
            print(f"  Qdrant collections: {col_names if col_names else 'none yet'}")
            if QDRANT_COLLECTION_NAME in col_names:
                print(f"  ✓ Collection '{QDRANT_COLLECTION_NAME}' exists")
            else:
                warnings.append(
                    f"Collection '{QDRANT_COLLECTION_NAME}' not found. "
                    "Run: python ingest.py"
                )
        elif resp.status_code == 403:
            errors.append("Qdrant API key is invalid")
        else:
            warnings.append(f"Qdrant responded with status {resp.status_code}")
    except Exception as e:
        errors.append(
            f"Cannot connect to Qdrant at {QDRANT_URL}. "
            f"Error: {e}\n"
            "  Start Qdrant: docker compose up -d"
        )

    for w in warnings:
        print(f"  Warning: {w}")

    if errors:
        for e in errors:
            print(f"  ERROR: {e}")
        return False

    return True