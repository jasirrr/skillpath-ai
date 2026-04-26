import json
import re
from openai import AsyncOpenAI
from app.core.config import get_settings

settings = get_settings()

# Initialize OpenAI client with OpenRouter base URL
client = AsyncOpenAI(
    api_key=settings.OPENAI_API_KEY,
    base_url="https://openrouter.ai/api/v1"
)

# Use a cheaper/faster model for low-credit keys
DEFAULT_MODEL = "google/gemini-2.0-flash-001"

def clean_json_content(content: str) -> str:
    """Helper to strip markdown code blocks and clean JSON string."""
    content = content.strip()
    # Remove ```json ... ``` or ``` ... ```
    if content.startswith("```"):
        content = re.sub(r'^```(?:json)?\s*', '', content)
        content = re.sub(r'\s*```$', '', content)
    return content.strip()

async def call_llm(prompt: str, response_format={"type": "json_object"}) -> dict:
    try:
        response = await client.chat.completions.create(
            model=DEFAULT_MODEL,
            messages=[
                {"role": "system", "content": "You are an AI Skill Assessment Expert. Always respond in valid JSON. Do not include markdown formatting."},
                {"role": "user", "content": prompt}
            ],
            response_format=response_format,
            max_tokens=4000,
            extra_headers={
                "HTTP-Referer": "https://localhost:3000",
                "X-Title": "AI Skill Planner"
            }
        )
        content = clean_json_content(response.choices[0].message.content)
        try:
            return json.loads(content)
        except json.JSONDecodeError as e:
            print(f"JSON Parse Error: {e}\nContent: {content}")
            # Try to extract anything that looks like a JSON object
            match = re.search(r'\{.*\}', content, re.DOTALL)
            if match:
                return json.loads(match.group())
            raise e
    except Exception as e:
        print(f"Error calling LLM: {e}")
        return {}

async def call_llm_list(prompt: str) -> list:
    try:
        response = await client.chat.completions.create(
            model=DEFAULT_MODEL,
            messages=[
                {"role": "system", "content": "You are an AI Skill Assessment Expert. Return ONLY a JSON list of strings."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=800,
            extra_headers={
                "HTTP-Referer": "https://localhost:3000",
                "X-Title": "AI Skill Planner"
            }
        )
        content = clean_json_content(response.choices[0].message.content)
        try:
            return json.loads(content)
        except:
            # Fallback for plain lists or bad JSON
            match = re.search(r'\[.*\]', content, re.DOTALL)
            if match:
                return json.loads(match.group())
            return re.findall(r'"([^"]*)"', content)
            
    except Exception as e:
        print(f"Error calling LLM List: {e}")
        return []
