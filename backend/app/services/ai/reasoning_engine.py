from app.services.ai.llm_engine import call_llm, call_llm_list
from app.core.prompt_templates import (
    SKILL_EXTRACTION_PROMPT, 
    JD_PARSING_PROMPT, 
    GAP_ANALYSIS_PROMPT,
    QUESTION_GENERATION_PROMPT,
    ROADMAP_GENERATION_PROMPT
)

async def extract_skills(text: str) -> list:
    prompt = SKILL_EXTRACTION_PROMPT.format(text=text)
    return await call_llm_list(prompt)

async def parse_jd(jd_text: str) -> list:
    prompt = JD_PARSING_PROMPT.format(jd_text=jd_text)
    return await call_llm_list(prompt)

async def analyze_skill_gaps(candidate_skills: list, job_skills: list, raw_resume_text: str = "") -> dict:
    prompt = GAP_ANALYSIS_PROMPT.format(
        candidate_skills=", ".join(candidate_skills),
        job_skills=", ".join(job_skills),
        raw_resume_text=raw_resume_text
    )
    return await call_llm(prompt)

async def generate_question(skill: str, difficulty: str, last_score: float = None, history_context: str = "") -> str:
    # Adaptive instruction
    difficulty_instruction = "This is the first question."
    if last_score is not None:
        if last_score < 4:
            difficulty_instruction = f"The user struggled (Score: {last_score}/10). Pivot to a more foundational but practical probe. History: {history_context}"
        elif last_score > 7:
            difficulty_instruction = f"The user was strong (Score: {last_score}/10). Escalate to a complex architectural or edge-case scenario. History: {history_context}"
        else:
            difficulty_instruction = f"The user was average (Score: {last_score}/10). Maintain difficulty but probe for more specific implementation details. History: {history_context}"

    prompt = QUESTION_GENERATION_PROMPT.format(
        skill=skill,
        difficulty=difficulty,
        difficulty_instruction=difficulty_instruction
    )
    
    result = await call_llm(prompt)
    return result.get("question", f"Could not generate a {difficulty} question for {skill}.")

async def generate_learning_roadmap(target_role: str, weak_skills: list) -> dict:
    prompt = ROADMAP_GENERATION_PROMPT.format(
        target_role=target_role,
        weak_skills=", ".join(weak_skills)
    )
    return await call_llm(prompt)
