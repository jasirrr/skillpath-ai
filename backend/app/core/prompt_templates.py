SKILL_EXTRACTION_PROMPT = """
You are an expert HR Analyst. Extract a list of professional skills from the following text.
Return ONLY a JSON list of strings.

Text:
{text}
"""

JD_PARSING_PROMPT = """
Extract a list of technical and soft skills explicitly mentioned in the following Job Description.

**STRICT RULES:**
1. ONLY extract skills that are EXPLICITLY WRITTEN in the text.
2. DO NOT infer or add common skills (like "Communication" or "Teamwork") if they are not explicitly mentioned.
3. If the JD is very short (e.g., just "Python"), return ONLY those specific words.

Job Description:
{jd_text}

Return a JSON list of strings: ["Skill 1", "Skill 2"]
"""

GAP_ANALYSIS_PROMPT = """
You are a meticulous Skill Gap Analyst. Compare the Candidate's Extracted Skills against the Job Requirements.

**CRITICAL RULE: DO NOT FLAG A SKILL AS MISSING IF IT IS MENTIONED ANYWHERE IN THE CANDIDATE'S TEXT.**
Check for synonyms, different capitalizations, and implicit context (e.g., if they know React, they know JavaScript).

Analyze carefully:
1. **Strong Matches**: Skills explicitly mentioned in both or clearly mastered.
2. **Partial Matches**: Skills mentioned but maybe not at the required depth or version.
3. **Missing Skills**: ONLY skills that are absolutely not found or implied in the candidate's profile.
4. **Adjacent Recommendations**: Skills NOT in the JD but would make the candidate stand out based on their current profile.

Candidate Skills: {candidate_skills}
Job Requirements: {job_skills}
Full Resume Text (for verification): {raw_resume_text}

Return ONLY a JSON object:
{{
  "strong_matches": [],
  "partial_matches": [],
  "missing_skills": [],
  "adjacent_recommendations": [
    {{"skill": "Name", "reason": "Why it helps"}}
  ]
}}
"""

QUESTION_GENERATION_PROMPT = """
You are a Senior Technical Lead conducting a high-stakes interview. 
Your goal is to distinguish between 'claimed' knowledge and 'real' proficiency in "{skill}".

Context:
- Current Difficulty: {difficulty}
- Feedback on previous answer: {difficulty_instruction}

Instructions:
- If this is the first question, start with a punchy {difficulty} probe.
- If the candidate was vague previously, ask a 'How exactly...' question to pin them down.
- If they were strong, present a complex, real-world trade-off scenario.
- Keep the tone professional, conversational, and inquisitive.

Return ONLY a JSON object:
{{
  "question": "The conversational probe text"
}}
"""

ANSWER_EVALUATION_PROMPT = """
Evaluate the following answer for the skill "{skill}" at {difficulty} level.
Question: {question}
User Answer: {answer}

Scoring Criteria:
- Correctness (0-10): Technical accuracy.
- Depth (0-10): Detail and clarity of explanation.
- Applicability (0-10): Practical relevance.

Difficulty Weights:
- Basic: 30%
- Intermediate: 30%
- Scenario-based: 40%

Return ONLY a JSON object:
{{
  "score": float (0-10),
  "feedback": "constructive feedback",
  "reasoning": "brief explanation of the score"
}}
"""

ROADMAP_GENERATION_PROMPT = """
Create a High-Fidelity 4-week learning roadmap for a candidate aiming for the role of {target_role}.
Focus on bridging these gaps: {weak_skills}.

Strategy:
- Prioritize 'Adjacent Skills' (knowledge proximity) for quick wins.
- Group related skills into logical weekly sprints.

Return ONLY a JSON object:
{{
  "target_role": "{target_role}",
  "weeks": [
    {{
      "week": 1,
      "sprint_goal": "A clear, motivating goal for the week",
      "topics": [
        {{
          "name": "Topic Name",
          "time_to_mastery": "X hours",
          "tasks": ["specific actionable task"],
          "recommended_resources": [
            {{"name": "Resource Name", "type": "Video/Docs/Course", "url": "Placeholder URL"}}
          ],
          "outcome": "What the candidate will be able to 'do' after this"
        }}
      ]
    }}
  ]
}}
"""
