import os
from google import genai
from google.genai import types

from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

client = genai.Client(api_key=GEMINI_API_KEY)

def summarize_keyword_significance(keyword: str, chunks: list):
    # System Instructions to enforce strict behavior
    system_instr = (
        "Role: Objective Data Analyst. Task: Summarize the significance of a specific [KEYWORD] based solely on the provided [CHUNKS]. "
        "Strict Constraints: No greetings, no salutations, no conversational filler. "
        "Only output the summary. If keyword is missing, say 'Keyword not found in context.'"
        "Ensure the summary is made in Markdown format beginning the summary with the Keyword as the heading."
    )
    user_prompt = f"KEYWORD: {keyword}\n\nCHUNKS:\n" + "\n---\n".join(chunks.CHUNK_TEXT)

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            config=types.GenerateContentConfig(
                system_instruction=system_instr,
                temperature=0.0  # Zero temperature for maximum deterministic focus
            ),
            contents=user_prompt
        )
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"
