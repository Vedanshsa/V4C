import logging
from dotenv import load_dotenv
import os
import asyncio

from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    ChatContext,
    ChatMessage,
    cli,
    room_io,
)
import httpx
from livekit.plugins import silero, sarvam, ai_coustics, openai
from livekit.plugins.turn_detector.multilingual import MultilingualModel
from workflow.config import instructions, QDRANT_COLLECTION_NAME, QDRANT_URL, QDRANT_API_KEY
from qdrant_client import QdrantClient

logger = logging.getLogger("agent")
load_dotenv(".env")



qdrant = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY,
)

COLLECTION = QDRANT_COLLECTION_NAME

OLLAMA_URL = "http://localhost:11434/api/embed"
OLLAMA_MODEL = "all-minilm"

async def embed_query(text: str):
    async with httpx.AsyncClient(timeout=10) as client:
        res = await client.post(
            OLLAMA_URL,
            json={
                "model": OLLAMA_MODEL,
                "input": text
            }
        )

        return res.json()["embeddings"][0]



async def my_rag_lookup(query: str):
    vector = await embed_query(query)
    results = qdrant.query_points(
        collection_name=COLLECTION,
        query=vector,
        limit=5
    )
    texts = []
    for point in results.points:
        payload = point.payload
        if payload and "text" in payload:
            texts.append(payload["text"])
    return "\n".join(texts)



server = AgentServer(
    ws_url=os.getenv("LIVEKIT_URL"),
    api_key=os.getenv("LIVEKIT_API_KEY"),
    api_secret=os.getenv("LIVEKIT_API_SECRET"),
)


def prewarm(proc: JobProcess):
    logger.info("⚙️ Prewarming VAD...")
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


# =========================
# AGENT
# =========================
class Assistant(Agent):
    def __init__(self):
        super().__init__(instructions=instructions)

    async def on_user_turn_completed(
        self,
        turn_ctx: ChatContext,
        new_message: ChatMessage,
    ) -> None:

        query = str(new_message)
        logger.info(f"🧑 User: {query}")

        self.session.generate_reply(
            allow_interruptions=True,
            chat_ctx=turn_ctx.copy(),
            instructions=f"""
User said: "{query}"

Respond VERY briefly (max 6 words).
Same language.
"""
        )
        

        rag_task = asyncio.create_task(my_rag_lookup(query))

        
        async def generate_final():
            rag_content = await rag_task
            turn_ctx.add_message(
                role="system",
                content=f"""
    Use ONLY this context:

    {rag_content}

    Rules:
    - No hallucination
    - Short answers
    - Natural speech
    """
            )

            # Generate answer AFTER RAG ready
            await self.session.generate_reply(
                chat_ctx=turn_ctx,
                allow_interruptions=True,
            )

        # 🔥 IMPORTANT: DO NOT await
        asyncio.create_task(generate_final())


@server.rtc_session(agent_name="my-agent")
async def entrypoint(ctx: JobContext):
    logger.info(f"🚀 Session started: {ctx.room.name}")
    
    session = AgentSession(
        stt=sarvam.STT(
            model="saaras:v3",
            mode="transcribe",
        ),
        llm=openai.LLM.with_ollama(
            model="gpt-oss:120b-cloud",
            base_url="http://localhost:11434/v1",
        ),
        tts=sarvam.TTS(
            target_language_code="en-IN",
            model="bulbul:v3",
            speaker="shubh",
            pace=1.0,
            temperature=0.6,
            output_audio_bitrate="128k",
            min_buffer_size=50,
            max_chunk_length=150,
        ),
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"]
    )

    await ctx.connect()

    await session.start(
        agent=Assistant(),
        room=ctx.room,
        room_options=room_io.RoomOptions(
            close_on_disconnect=True,
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=ai_coustics.audio_enhancement(
                    model=ai_coustics.EnhancerModel.QUAIL_VF_L
                ),
            ),
        ),
    )

    logger.info("✅ Connected")

    await session.generate_reply(
        instructions="Greet the user and ask how you can help with compliance.",
        allow_interruptions=False,
    )


if __name__ == "__main__":
    cli.run_app(server)


# import logging
# from dotenv import load_dotenv
# import os
# from livekit.agents import (
#     Agent,
#     AgentServer,
#     AgentSession,
#     JobContext,
#     JobProcess,
#     ChatContext,
#     ChatMessage,
#     cli,
#     room_io,
# )
# import asyncio
# from livekit.plugins import silero, sarvam, ai_coustics, openai
# from livekit.plugins.turn_detector.multilingual import MultilingualModel
# from workflow.config import instructions
# from workflow.ingest import load_vectorstore

# logger = logging.getLogger("agent")
# load_dotenv(".env")

# vectorstore = load_vectorstore()

# retriever = vectorstore.as_retriever(search_kwargs={"k": 3})  # top 3 chunks


# server = AgentServer(
#     ws_url=os.getenv("LIVEKIT_URL"),
#     api_key=os.getenv("LIVEKIT_API_KEY"),
#     api_secret=os.getenv("LIVEKIT_API_SECRET"),
# )


# def prewarm(proc: JobProcess):
#     logger.info("⚙️ Prewarming VAD...")
#     proc.userdata["vad"] = silero.VAD.load()


# server.setup_fnc = prewarm


# async def my_rag_lookup(query: str) -> str:
#     loop = asyncio.get_event_loop()
#     docs = await loop.run_in_executor(
#         None, lambda: retriever.get_relevant_documents(query)
#     )
#     if not docs:
#         return ""
#     context = "\n\n".join([doc.page_content for doc in docs])

#     return context[:1500]


# class Assistant(Agent):
#     def __init__(self):
#         super().__init__(instructions=instructions)

#     async def on_user_turn_completed(
#         self,
#         turn_ctx: ChatContext,
#         new_message: ChatMessage,
#     ) -> None:
#         query = new_message
#         logger.info(f"User just asked: {query}")
#         asyncio.create_task(
#             self.session.generate_reply(
#                 add_to_chat_ctx=False,
#                 allow_interruptions=True,
#                 chat_ctx=turn_ctx.copy(),
#                 instructions="""
#         User just asked something.

#         Immediately respond with a VERY SHORT message (1 sentence max)
#         telling them you are processing their request.

#         IMPORTANT:
#         - Respond in the SAME language as the user
#         - Keep it natural and conversational
#         - Do NOT answer the question yet
#         """,
#             )
#         )

#         rag_content = await my_rag_lookup(query)

#         turn_ctx.add_message(
#             role="system",
#             content=f"""
# You are a compliance assistant AI.

# Use the following context to answer accurately:

# {rag_content}

# Rules:
# - Do NOT hallucinate
# - If unsure, say you don't know
# - Keep answers clear and concise
# """,
#         )


# @server.rtc_session(agent_name="my-agent")
# async def entrypoint(ctx: JobContext):
#     logger.info(f"🚀 Session started: {ctx.room.name}")

#     session = AgentSession(
#         stt=sarvam.STT(
#             model="saaras:v3",
#             mode="transcribe",
#         ),
#         llm=openai.LLM.with_ollama(
#             model="gpt-oss:120b-cloud",
#             base_url="http://localhost:11434/v1",
#         ),
#         tts=sarvam.TTS(
#             target_language_code="en-IN",
#             model="bulbul:v3",
#             speaker="shubh",
#             pace=1.0,
#             temperature=0.6,
#             output_audio_bitrate="128k",
#             min_buffer_size=50,
#             max_chunk_length=150,
#         ),
#         turn_detection=MultilingualModel(),
#         vad=ctx.proc.userdata["vad"],
#         preemptive_generation=False,
#     )

#     await ctx.connect()
#     agent = Assistant()
#     await session.start(
#         agent=agent,
#         room=ctx.room,
#         room_options=room_io.RoomOptions(
#             close_on_disconnect=True,
#             audio_input=room_io.AudioInputOptions(
#                 noise_cancellation=ai_coustics.audio_enhancement(
#                     model=ai_coustics.EnhancerModel.QUAIL_VF_L
#                 ),
#             ),
#         ),
#     )

#     logger.info("✅ Connected")

#     await session.generate_reply(
#         instructions="Greet the user and ask how you can help with compliance.",
#         allow_interruptions=False,
#     )


# if __name__ == "__main__":
#     cli.run_app(server)
