from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from typing import List
from app.models.models import (
    UserSession, SkillGap, AssessmentQuestion, 
    AssessmentAnswer, AssessmentResult, Roadmap
)
from app.services.ai.reasoning_engine import (
    extract_skills, parse_jd, analyze_skill_gaps, 
    generate_question, generate_learning_roadmap
)
from app.services.ai.scoring_engine import (
    evaluate_answer, calculate_weighted_score, get_skill_level
)
from app.services.ai.llm_engine import call_llm
from app.db.database import get_database
from pdfminer.high_level import extract_text as extract_pdf_text
import io
import uuid

from app.core.auth import get_password_hash, verify_password, create_access_token
from app.models.models import User
import uuid

router = APIRouter()

@router.post("/auth/register")
async def register(email: str = Form(...), password: str = Form(...), name: str = Form(None)):
    db = get_database()
    existing_user = await db.users.find_one({"email": email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=email,
        hashed_password=get_password_hash(password),
        full_name=name
    )
    await db.users.insert_one(user.dict())
    
    return {"access_token": token, "token_type": "bearer", "user": {"id": user.id, "email": user.email, "name": user.full_name}}

@router.post("/auth/login")
async def login(email: str = Form(...), password: str = Form(...)):
    db = get_database()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": user["id"]})
    return {"access_token": token, "token_type": "bearer", "user": {"id": user["id"], "email": user["email"], "name": user["full_name"]}}

@router.post("/upload", response_model=UserSession)
async def upload_resume_and_jd(
    resume: UploadFile = File(None),
    resume_text: str = Form(None),
    jd_text: str = Form(...),
    user_id: str = Form(None)
):
    text = ""
    if resume:
        content = await resume.read()
        if resume.filename.endswith(".pdf"):
            text = extract_pdf_text(io.BytesIO(content))
        else:
            text = content.decode("utf-8")
    elif resume_text:
        text = resume_text
    else:
        raise HTTPException(status_code=400, detail="No resume provided")

    # Sanitize user_id
    if user_id in [None, "null", "undefined", ""]:
        user_id = None

    # Extract skills
    candidate_skills = await extract_skills(text)
    job_skills = await parse_jd(jd_text)
    
    if not candidate_skills or not job_skills:
        raise HTTPException(status_code=500, detail="Failed to extract skills from inputs. Please check your API key.")
    
    # Analyze gaps
    gaps_data = await analyze_skill_gaps(candidate_skills, job_skills, raw_resume_text=text)
    if not gaps_data:
        raise HTTPException(status_code=500, detail="AI analysis failed. Please try again.")
        
    try:
        gaps = SkillGap(**gaps_data)
    except Exception as e:
        # Fallback to empty gaps if validation fails
        gaps = SkillGap(strong_matches=[], partial_matches=[], missing_skills=[], adjacent_recommendations=[])
    
    session = UserSession(
        id=str(uuid.uuid4()),
        user_id=user_id,
        resume_text=text,
        jd_text=jd_text,
        job_title=jd_text.split('\n')[0][:50], # Capture title from first line
        extracted_skills=candidate_skills,
        job_skills=job_skills,
        skill_gaps=gaps
    )
    
    # Save to MongoDB
    db = get_database()
    await db.sessions.insert_one(session.model_dump())
    
    return session

@router.get("/analyze-gap/{session_id}", response_model=SkillGap)
async def get_gap_analysis(session_id: str):
    db = get_database()
    session = await db.sessions.find_one({"id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    gaps = session["skill_gaps"]
    
    # Calculate merit score if not already present or for freshness
    total_skills = len(gaps["strong_matches"]) + len(gaps["partial_matches"]) + len(gaps["missing_skills"])
    if total_skills > 0:
        weighted_score = (len(gaps["strong_matches"]) * 1.0) + (len(gaps["partial_matches"]) * 0.5)
        merit_score = (weighted_score / total_skills) * 10
    else:
        merit_score = 0
    
    gaps["merit_score"] = round(merit_score, 1)
    return gaps

@router.get("/start-assessment/{session_id}/{skill}", response_model=AssessmentQuestion)
async def start_assessment(session_id: str, skill: str):
    # Start with Basic difficulty
    question_text = await generate_question(skill, "Basic")
    return AssessmentQuestion(
        skill=skill,
        question=question_text,
        difficulty="Basic",
        question_index=1
    )

@router.post("/submit-answer", response_model=AssessmentResult)
async def submit_answer(answer_data: AssessmentAnswer):
    db = get_database()
    session = await db.sessions.find_one({"id": answer_data.session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Evaluate answer
    evaluation = await evaluate_answer(answer_data)
    score = evaluation["score"]
    
    # Store result in session history
    await db.sessions.update_one(
        {"id": answer_data.session_id},
        {"$push": {"history": {
            "skill": answer_data.skill,
            "question": answer_data.question,
            "answer": answer_data.answer,
            "difficulty": answer_data.difficulty,
            "score": score,
            "feedback": evaluation["feedback"]
        }}}
    )
    
    # Determine next question or finish
    next_index = answer_data.question_index + 1
    if next_index > 3:
        # Fetch latest session to get all scores including the current one
        updated_session = await db.sessions.find_one({"id": answer_data.session_id})
        history = updated_session.get("history", [])
        # Filter history for only this skill
        skill_history = [h for h in history if h.get("skill") == answer_data.skill]
        
        # Calculate final weighted score
        all_scores = [h["score"] for h in skill_history]
        # We need weights for Basic (1x), Intermediate (1.5x), Scenario (2x)
        weights = [1.0, 1.5, 2.0]
        # Use as many scores as we have (in case history is incomplete)
        weighted_sum = sum(s * w for s, w in zip(all_scores, weights[:len(all_scores)]))
        max_weighted = sum(10 * w for w in weights[:len(all_scores)])
        final_score_pct = (weighted_sum / max_weighted) * 100 if max_weighted > 0 else 0
        
        # Determine skill level
        level = "Novice"
        if final_score_pct >= 85: level = "Expert"
        elif final_score_pct >= 70: level = "Proficient"
        elif final_score_pct >= 50: level = "Competent"
        
        return AssessmentResult(
            score=score,
            feedback=evaluation["feedback"],
            is_complete=True,
            final_score=round(final_score_pct, 1),
            skill_level=level
        )
    
    # Adaptive difficulty logic
    difficulties = ["Basic", "Intermediate", "Scenario-based"]
    next_difficulty = difficulties[next_index - 1]
    
    # Create history context for the agent
    history_context = ""
    if session.get("history"):
        last_interactions = session["history"][-2:] # Get last 2 interactions for context
        history_context = " | ".join([f"Q: {h['question']} A: {h['answer']} Feedback: {h['feedback']}" for h in last_interactions])

    next_question_text = await generate_question(
        answer_data.skill, 
        next_difficulty, 
        last_score=score,
        history_context=history_context
    )
    
    next_q = AssessmentQuestion(
        skill=answer_data.skill,
        question=next_question_text,
        difficulty=next_difficulty,
        question_index=next_index
    )
    
    return AssessmentResult(
        score=score,
        feedback=evaluation["feedback"],
        next_question=next_q,
        is_complete=False
    )

@router.get("/generate-roadmap/{session_id}", response_model=Roadmap)
async def get_roadmap(session_id: str):
    db = get_database()
    session = await db.sessions.find_one({"id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # If roadmap already exists in session, return it (to preserve progress)
    if session.get("roadmap"):
        return Roadmap(**session["roadmap"])
    
    # Try to infer target role from JD or use a generic one
    target_role = session.get("job_title", "Target Role")
    if target_role == "Target Role" and session.get("jd_text"):
        target_role = session["jd_text"].split("\n")[0][:50]
    
    weak_skills = session["skill_gaps"]["missing_skills"] + session["skill_gaps"]["partial_matches"]
    roadmap_data = await generate_learning_roadmap(target_role, weak_skills)
    
    final_roadmap = None
    if not roadmap_data or "weeks" not in roadmap_data:
        final_roadmap = Roadmap(
            target_role=target_role,
            weeks=[{
                "week": 1,
                "sprint_goal": "Initial Assessment",
                "topics": [{
                    "name": "General Preparation",
                    "time_to_mastery": "5h",
                    "tasks": ["Review job description", "Brush up on basics"],
                    "recommended_resources": [{"name": "MDN/Official Docs", "type": "Docs", "url": "#"}],
                    "outcome": "Ready to dive into technical skills",
                    "is_completed": False
                }],
                "is_completed": False
            }]
        )
    else:
        final_roadmap = Roadmap(**roadmap_data)
        
    # Save the roadmap to the session
    await db.sessions.update_one(
        {"id": session_id},
        {"$set": {"roadmap": final_roadmap.dict()}}
    )
    
    return final_roadmap

@router.post("/roadmap/{session_id}/toggle-task")
async def toggle_task(session_id: str, week: int = Form(...), topic_idx: int = Form(...), task: str = Form(...)):
    db = get_database()
    session = await db.sessions.find_one({"id": session_id})
    if not session or not session.get("roadmap"):
        raise HTTPException(status_code=404, detail="Roadmap not found")
    
    roadmap = session["roadmap"]
    # Find the correct week and topic
    for w in roadmap["weeks"]:
        if w["week"] == week:
            topic = w["topics"][topic_idx]
            if "completed_tasks" not in topic:
                topic["completed_tasks"] = []
            
            if task in topic["completed_tasks"]:
                topic["completed_tasks"].remove(task)
            else:
                topic["completed_tasks"].append(task)
            
            # Check if all tasks are done for this topic
            topic["is_completed"] = len(topic["completed_tasks"]) == len(topic["tasks"])
            
            # Check if all topics are done for this week
            w["is_completed"] = all(t.get("is_completed", False) for t in w["topics"])
            break
            
    await db.sessions.update_one(
        {"id": session_id},
        {"$set": {"roadmap": roadmap}}
    )
    return {"status": "success", "roadmap": roadmap}

@router.post("/chat/{session_id}")
async def chat_with_agent(session_id: str, message: str = Form(...)):
    db = get_database()
    session = await db.sessions.find_one({"id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Construct context
    context = f"Resume: {session['resume_text'][:2000]} | JD: {session['jd_text'][:2000]} | Gaps: {session['skill_gaps']}"
    
    # Get previous chat history if any
    history = session.get("chat_history", [])
    history_str = " | ".join([f"User: {h['user']} AI: {h['ai']}" for h in history[-5:]])
    
    prompt = f"""
    You are an expert Career Coach Agent. You are helping a candidate prepare for a specific job.
    
    CRITICAL CONTEXT:
    - JOB DESCRIPTION: {session['jd_text']}
    - CANDIDATE RESUME: {session['resume_text']}
    - IDENTIFIED GAPS: {session['skill_gaps']}
    
    RECENT CONVERSATION:
    {history_str}
    
    USER'S QUESTION:
    "{message}"
    
    INSTRUCTIONS:
    1. If the user asks about the JD or Resume, use the CRITICAL CONTEXT above to provide specific answers.
    2. Maintain a professional, encouraging, and highly knowledgeable tone.
    3. If they ask about gaps, refer to the 'IDENTIFIED GAPS' section.
    4. Keep your response concise but insightful.
    
    Return ONLY a JSON object:
    {{
      "response": "your advice or answer here"
    }}
    """
    
    response = await call_llm(prompt)
    ai_message = response.get("response", response.get("answer", "I'm here to help with your career journey."))
    
    # Save to history
    await db.sessions.update_one(
        {"id": session_id},
        {"$push": {"chat_history": {"user": message, "ai": ai_message}}}
    )
    
    return {"response": ai_message}

@router.get("/user/sessions/{user_id}")
async def get_user_sessions(user_id: str):
    if user_id in [None, "null", "undefined", ""]:
        return []
    db = get_database()
    sessions = await db.sessions.find({"user_id": user_id}).sort("created_at", -1).to_list(100)
    for s in sessions:
        s["_id"] = str(s["_id"])
    return sessions
@router.get("/final-report/{session_id}")
async def get_final_report(session_id: str):
    db = get_database()
    session = await db.sessions.find_one({"id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Calculate final scores for each skill assessed
    history = session.get("history", [])
    skill_scores = {}
    skill_evals = {}
    
    for h in history:
        skill = h["skill"]
        if skill not in skill_evals:
            skill_evals[skill] = []
        skill_evals[skill].append({"difficulty": h["difficulty"], "score": h["score"]})
        
    final_scores = {}
    for skill, scores in skill_evals.items():
        avg_score = calculate_weighted_score(scores)
        final_scores[skill] = {
            "score": avg_score,
            "level": get_skill_level(avg_score)
        }
        
    return {
        "session_id": session_id,
        "gaps": session["skill_gaps"],
        "skill_scores": final_scores,
        "overall_evaluation": "Analysis complete."
    }
