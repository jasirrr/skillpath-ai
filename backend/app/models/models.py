from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime
import uuid

class Skill(BaseModel):
    name: str
    level: Optional[str] = None # Beginner, Intermediate, Strong
    score: Optional[float] = 0.0

from typing import List, Optional, Dict, Union

class SkillGap(BaseModel):
    strong_matches: List[str]
    partial_matches: List[str]
    missing_skills: List[str]
    adjacent_recommendations: List[Union[Dict[str, str], str]]
    merit_score: float = 0.0

class AssessmentQuestion(BaseModel):
    skill: str
    question: str
    difficulty: str # Basic, Intermediate, Scenario-based
    question_index: int # 1, 2, 3

class AssessmentAnswer(BaseModel):
    session_id: str
    skill: str
    question: str
    answer: str
    difficulty: str
    question_index: int

class AssessmentResult(BaseModel):
    score: float # Current answer score (0-10)
    feedback: str
    next_question: Optional[AssessmentQuestion] = None
    is_complete: bool = False
    final_score: Optional[float] = None # Final weighted score (0-100)
    skill_level: Optional[str] = None # e.g. "Expert"

class Resource(BaseModel):
    name: str
    type: Optional[str] = "Link"
    url: Optional[str] = "#"

class RoadmapTopic(BaseModel):
    name: str
    time_to_mastery: Optional[str] = "2-4 hours"
    tasks: List[str]
    completed_tasks: List[str] = [] # List of task names that are done
    recommended_resources: Optional[List[Resource]] = []
    outcome: Optional[str] = ""
    is_completed: bool = False

class RoadmapWeek(BaseModel):
    week: int
    sprint_goal: Optional[str] = ""
    topics: List[RoadmapTopic]
    is_completed: bool = False

class Roadmap(BaseModel):
    target_role: str
    weeks: List[RoadmapWeek]

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    hashed_password: str
    full_name: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)

class UserSession(BaseModel):
    id: str = Field(default_factory=lambda: datetime.now().strftime("%Y%m%d%H%M%S"))
    user_id: Optional[str] = None # Link to User
    resume_text: str
    jd_text: str
    job_title: Optional[str] = None
    extracted_skills: List[str]
    job_skills: List[str]
    skill_gaps: SkillGap
    scores: Dict[str, float] = {} # skill_name: average_score
    history: List[Dict] = [] # Chat history
    created_at: datetime = Field(default_factory=datetime.now)
