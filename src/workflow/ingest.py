import os
import sys
import warnings
from dotenv import load_dotenv

load_dotenv()
warnings.filterwarnings("ignore", category=DeprecationWarning)

from langchain_community.document_loaders import PyPDFLoader
from langchain_ollama import OllamaEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

from workflow.config import (
    PDF_FOLDER,
    CHUNK_SIZE, CHUNK_OVERLAP,
    OLLAMA_BASE_URL, OLLAMA_EMBED_MODEL,
    QDRANT_URL, QDRANT_API_KEY, QDRANT_COLLECTION_NAME,
    validate_config,
)


# ---------------- EMBEDDINGS ----------------
def get_embeddings():
    return OllamaEmbeddings(
        model=OLLAMA_EMBED_MODEL,
        base_url=OLLAMA_BASE_URL,
    )


# ---------------- QDRANT CLIENT (HTTP + Auth) ----------------
def get_qdrant_client():
    return QdrantClient(
        url=QDRANT_URL,
        api_key=QDRANT_API_KEY,
    )


# ---------------- LOAD PDFs ----------------
def load_all_pdfs(folder_path):
    all_docs = []

    if not os.path.exists(folder_path):
        os.makedirs(folder_path)

    pdf_files = sorted([
        f for f in os.listdir(folder_path)
        if f.lower().endswith(".pdf")
    ])

    if not pdf_files:
        print(f"\nNo PDFs found in: {folder_path}")
        sys.exit(1)

    print(f"\nFound {len(pdf_files)} PDF(s)\n")

    for filename in pdf_files:
        filepath = os.path.join(folder_path, filename)
        print(f"Loading: {filename}")

        try:
            loader = PyPDFLoader(filepath)
            docs = loader.load()

            for i, doc in enumerate(docs):
                doc.metadata["source_file"] = filename
                doc.metadata["page"] = i + 1

            all_docs.extend(docs)
            print(f"   {len(docs)} pages loaded")

        except Exception as e:
            print(f"   Error: {e}")

    print(f"\nTotal pages: {len(all_docs)}")
    return all_docs


# ---------------- CHUNKING ----------------
def split_documents(docs):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    chunks = splitter.split_documents(docs)
    print(f"Chunks created: {len(chunks)}")
    return chunks


# ---------------- GET EMBEDDING DIMENSION ----------------
def get_embedding_dimension(embeddings):
    test_embedding = embeddings.embed_query("test")
    return len(test_embedding)


# ---------------- CREATE VECTORSTORE ----------------
def create_vectorstore(chunks):
    print(f"\nUsing embedding model: {OLLAMA_EMBED_MODEL}")
    print(f"Qdrant: {QDRANT_URL}")
    print(f"Collection: {QDRANT_COLLECTION_NAME}")
    print(f"Auth: {'Enabled' if QDRANT_API_KEY else 'Disabled'}")
    print("Creating embeddings and uploading to Qdrant...\n")

    embeddings = get_embeddings()
    client = get_qdrant_client()

    # client.delete_collection(QDRANT_COLLECTION_NAME)

    # Get embedding dimension
    print("  Detecting embedding dimension...")
    embed_dim = get_embedding_dimension(embeddings)
    print(f"  Embedding dimension: {embed_dim}")

    # Delete existing collection
    existing = [c.name for c in client.get_collections().collections]
    if QDRANT_COLLECTION_NAME in existing:
        print(f"  Deleting existing collection '{QDRANT_COLLECTION_NAME}'...")
        client.delete_collection(QDRANT_COLLECTION_NAME)

    # Create collection
    print(f"  Creating collection '{QDRANT_COLLECTION_NAME}'...")
    client.create_collection(
        collection_name=QDRANT_COLLECTION_NAME,
        vectors_config=VectorParams(
            size=embed_dim,
            distance=Distance.COSINE,
        ),
    )

    # Upload via LangChain integration
    print(f"  Uploading {len(chunks)} chunks...")

    vectorstore = QdrantVectorStore(
        client=client,
        collection_name=QDRANT_COLLECTION_NAME,
        embedding=embeddings,
    )
    vectorstore.add_documents(chunks)

    # Verify
    info = client.get_collection(QDRANT_COLLECTION_NAME)
    print(f"\n  Collection points: {info.points_count}")
    print(f"  Vector dimension:  {info.config.params.vectors.size}")
    print(f"\nSaved to Qdrant collection: {QDRANT_COLLECTION_NAME}")

    client.close()
    return vectorstore


# ---------------- LOAD EXISTING ----------------
def load_vectorstore():
    client = get_qdrant_client()
    existing = [c.name for c in client.get_collections().collections]
    if QDRANT_COLLECTION_NAME not in existing:
        print(f"Collection '{QDRANT_COLLECTION_NAME}' not found. Run ingest.py first.")
        sys.exit(1)

    embeddings = get_embeddings()

    vectorstore = QdrantVectorStore(
        client=client,
        collection_name=QDRANT_COLLECTION_NAME,
        embedding=embeddings,
    )

    info = client.get_collection(QDRANT_COLLECTION_NAME)
    print(f"Vector store loaded ({info.points_count} points)")
    return vectorstore


# ---------------- MAIN ----------------
def run_ingestion():
    print("\n" + "=" * 60)
    print("PDF INGESTION PIPELINE (OLLAMA + QDRANT)")
    print("=" * 60)

    if not validate_config():
        sys.exit(1)

    docs = load_all_pdfs(PDF_FOLDER)
    chunks = split_documents(docs)
    create_vectorstore(chunks)

    print("\n" + "=" * 60)
    print("DONE! Now run: python main.py")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    run_ingestion()