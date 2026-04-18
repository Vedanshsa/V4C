import asyncio
from livekit import api
import json

# -----------------------------
# CONFIG
# -----------------------------
LIVEKIT_URL = "https://v4d-server.varshit.dev"
API_KEY = "APIFGefPGqqhY4x"
API_SECRET = "66WLXKpggTiteTMYg1ugwVFz7sdnfjbwKnfkleNK17BD"

TRUNK_ID = "ST_ZqARG4WGY9tv"  # 👈 your VoBiz outbound trunk ID

phone = "+918191943426"

prompt = """
    Alert Type: GST
Title: GST Return Filing Deadline Approaching
Description: Your GSTR-3B filing deadline for this month is approaching.
Urgency Level: High
Deadline: 20th April
Recommended Action: Please file your return to avoid penalties.

User Details:
- Name: Varshit
- Business Type: Retail
- Preferred Language: Hinglish
"""

metadata = json.dumps({
    "phone_number": phone,
    "user_name": "Varshit",
    "alert_type": "GST",
    "language": "hinglish"
})

# -----------------------------
# START CALL FUNCTION
# -----------------------------
async def start_call(phone_number: str):
    lk = api.LiveKitAPI(
        url=LIVEKIT_URL,
        api_key=API_KEY,
        api_secret=API_SECRET,
    )

    # 👇 IMPORTANT: must match dispatch rule prefix
    room_name = f"call-{phone_number}"

    try:
        await lk.agent_dispatch.create_dispatch(
            api.CreateAgentDispatchRequest(
                # Use the agent name you set in the rtc_session decorator
                agent_name="outbound-agent",
                # The room name to use.
                room=room_name,
                # Here we use JSON to pass the phone number, and could add more information if needed.
                metadata=metadata,
            )
        )
        # await lk.sip.create_sip_participant(
        #     api.CreateSIPParticipantRequest(
        #         sip_trunk_id=TRUNK_ID,
        #         room_name=room_name,
        #         sip_call_to=phone_number,
        #         participant_name="customer",
        #     )
        # )
        print(f"📞 Calling {phone_number}")
        print(f"🏠 Room: {room_name}")
        print("🤖 Agent will auto join via dispatch")

    except Exception as e:
        print("❌ Call failed:", str(e))


# -----------------------------
# RUN
# -----------------------------
if __name__ == "__main__":
    asyncio.run(start_call(phone))
