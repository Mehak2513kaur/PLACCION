<div align="center">
  <h1>🚀 PLACCION</h1>
  <p align="center">
    <strong>AI-Powered Career & Placement Predictor Platform</strong>
  </p>
  
  <p align="center">
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
    <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" />
    <img src="https://img.shields.io/badge/scikit_learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white" />
    <img src="https://img.shields.io/badge/Machine%20Learning-blue?style=for-the-badge" />
  </p>
</div>

## ✨ Overview

**PLACCION** is an intelligent, full-stack career platform designed to help students and placement cells predict job placements and match candidates with perfect career roles. By combining a modern React dashboard with a powerful FastAPI Machine Learning backend, PLACCION extracts, analyzes, and predicts career outcomes with incredible precision.

---

## 🌟 Key Features

- **📄 AI Resume Parsing:** Simply upload a PDF resume, and our backend NLP engine will automatically extract your CGPA, coding skills, projects, and internships.
- **🤖 Explainable AI Insights:** PLACCION doesn't just give you a number. It provides detailed, human-readable insights highlighting your **Strong Areas** and exactly what **Needs Improvement**.
- **🎯 Dynamic Recruiter Match Scores:** See how closely your profile aligns with specific industry roles (Software Engineer, ML Engineer, Data Analyst, Business Analyst) through highly sensitive heuristic algorithms.
- **⚡ Hybrid Architecture:** A blazingly fast FastAPI backend running optimized XGBoost & Random Forest ensembles, paired with a gorgeous Vite + React frontend dashboard.

---

## 🛠️ Technology Stack

### Frontend
- **React.js (Vite)**
- **Lucide Icons & Recharts** for stunning data visualization
- **Custom CSS** for a premium, glassmorphic UI

### Backend & AI
- **Python (FastAPI)**
- **Scikit-Learn & XGBoost** (Hyperparameter Tuned Ensemble Voting Classifier)
- **PyPDF2** for robust PDF resume parsing
- **Pandas & NumPy** for data processing

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Mehak2513kaur/PLACCION.git
cd PLACCION
```

### 2. Run the Backend (FastAPI)
```bash
# It is recommended to use a virtual environment
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```
*The API will start at `http://localhost:8000`*

### 3. Run the Frontend (React/Vite)
Open a new terminal and run:
```bash
cd frontend
npm install
npm run dev
```
*The dashboard will be live at `http://localhost:5173`*

---

## 🧠 How the ML Model Works
Our prediction engine is powered by an advanced **Voting Classifier** that ensembles hyperparameter-tuned **XGBoost** and **Random Forest** models. It assesses over a dozen granular features (from Data Structures proficiency to Hackathon participation) to generate a placement probability score with exceptional accuracy.

---
<div align="center">
  <i>Built with ❤️ for the future of careers.</i>
</div>
