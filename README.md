# SkillPath AI 🚀

An intelligent MVP that analyzes resume-job description gaps and conducts conversational AI assessments to generate personalized learning roadmaps.

## 🚀 Features

- **AI Logic Layer**: Structured reasoning using specialized engines for scoring and reasoning.
- **Scientific Scoring**: Weighted evaluation (30% Basic, 30% Intermediate, 40% Scenario) for deep skill validation.
- **Adaptive Questioning**: Dynamic difficulty adjustment based on candidate performance.
- **Adjacent Skill Intelligence**: Recommends "easy-win" skills to maximize career impact.
- **Conversational Assessment**: Interactive chat-based evaluation (not boring MCQs).
- **Personalized Roadmap**: 4-week time-bound learning plan with resources.

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS, Framer Motion, Lucide React.
- **Backend**: FastAPI (Python), Motor (Async MongoDB), OpenAI GPT-4o.
- **Database**: MongoDB.
- **Parsing**: pdfminer.six for robust PDF resume extraction.

## 📁 Project Structure

```
/backend
  /app
    /api          # FastAPI endpoints
    /core         # Config & Prompt Templates
    /db           # MongoDB connection
    /models       # Pydantic schemas
    /services/ai  # AI Engines (LLM, Scoring, Reasoning)
  main.py         # Entry point
/frontend
  /src
    /api          # Axios client
    /components   # Reusable UI
    /pages        # App views
    /styles       # Tailwind config
  tailwind.config.js
```

## ⚙️ Local Setup Instructions

### 1. Prerequisites
Ensure you have the following installed:
- **Python 3.10+**
- **Node.js 18+**
- **MongoDB** (Running locally or a MongoDB Atlas URI)
- **OpenRouter API Key** (or OpenAI Key)

---

### 2. Backend Setup
1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```
2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```
3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
4. **Environment Configuration:**
   - Copy the example environment file:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and add your credentials:
     ```env
     OPENAI_API_KEY=your_key_here
     MONGODB_URI=mongodb://localhost:27017
     DATABASE_NAME=skillpath_ai
     ```
5. **Start the server:**
   ```bash
   uvicorn main:app --reload
   ```
   *The API will be available at `http://localhost:8000`*

---

### 3. Frontend Setup
1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the development server:**
   ```bash
   npm run dev
   ```
   *The dashboard will be available at `http://localhost:3000`*

## 🧠 AI Engine Details

### Scoring Engine
Each answer is evaluated on:
- **Correctness**: Technical accuracy.
- **Depth**: Depth of explanation.
- **Applicability**: Real-world usage.

Final skill score is a weighted average of 3 questions (Basic, Intermediate, Scenario).

### Adaptive Logic
- If `score < 4`: Next question difficulty is maintained or simplified.
- If `score > 7`: Next question difficulty is escalated.

## 🏆 Why This Is Unique
Unlike standard platforms that use static MCQs, this app uses **generative AI to probe actual depth of knowledge**. The adaptive nature ensures candidates are neither bored nor overwhelmed, and the adjacent skill recommendations provide a realistic, high-ROI growth path.
