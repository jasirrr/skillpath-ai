SKILL_EXTRACTION_PROMPT = """
You are an expert HR Analyst. Extract a list of professional skills from the following text.
Return ONLY a JSON list of strings.

Text:
{text}
"""

JD_PARSING_PROMPT = """
Extract the core technical and soft skills required for the following Job Description.
Return ONLY a JSON list of strings.

Job Description:
{jd_text}
"""

GAP_ANALYSIS_PROMPT = """
You are a Strategic Career Architect. Compare the candidate's resume claims with the Job Description.
Identify:
1. strong_matches: Skills confirmed by experience.
2. partial_matches: Skills mentioned but needing validation.
3. missing_skills: Hard requirements missing from the resume.
4. adjacent_recommendations: Strategic 'Easy Wins'. Identify skills that are logically close to the candidate's current stack (Knowledge Proximity) and highly valued by the JD. (e.g., If they know React, suggest Next.js or Tailwind).

Provide a brief 'reasoning' for each adjacent recommendation.
Return ONLY a structured JSON object with these keys.

Candidate Skills: {candidate_skills}
Job Requirements: {job_skills}
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
