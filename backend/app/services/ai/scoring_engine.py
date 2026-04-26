from app.models.models import AssessmentAnswer
from app.services.ai.llm_engine import call_llm
from app.core.prompt_templates import ANSWER_EVALUATION_PROMPT

async def evaluate_answer(answer_data: AssessmentAnswer) -> dict:
    prompt = ANSWER_EVALUATION_PROMPT.format(
        skill=answer_data.skill,
        difficulty=answer_data.difficulty,
        question=answer_data.question,
        answer=answer_data.answer
    )
    
    evaluation = await call_llm(prompt)
    
    # Ensure all required fields are present
    if "score" not in evaluation:
        evaluation["score"] = 0.0
    if "feedback" not in evaluation:
        evaluation["feedback"] = "Could not evaluate answer."
        
    return evaluation

def calculate_weighted_score(scores: list) -> float:
    """
    scores is a list of dicts: {'difficulty': str, 'score': float}
    Weights: Basic (30%), Intermediate (30%), Scenario (40%)
    """
    weights = {
        "Basic": 0.3,
        "Intermediate": 0.3,
        "Scenario-based": 0.4
    }
    
    total_weighted_score = 0.0
    total_weight_applied = 0.0
    
    for s in scores:
        diff = s.get("difficulty")
        score = s.get("score", 0.0)
        weight = weights.get(diff, 0.0)
        
        total_weighted_score += score * weight
        total_weight_applied += weight
        
    if total_weight_applied == 0:
        return 0.0
        
    return round(total_weighted_score / total_weight_applied, 2)

def get_skill_level(score: float) -> str:
    if score <= 3:
        return "Beginner"
    elif score <= 6:
        return "Intermediate"
    else:
        return "Strong"
