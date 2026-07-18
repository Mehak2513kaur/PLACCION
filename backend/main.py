from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
import os
from backend.parser import extract_text_from_pdf, parse_resume_text

app = FastAPI()

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Model
model_path = os.path.join(os.path.dirname(__file__), "..", "models", "best_model.pkl")
try:
    model_pipeline = joblib.load(model_path)
except Exception as e:
    print(f"Error loading model: {e}")
    model_pipeline = None

class StudentData(BaseModel):
    branch: str
    college_tier: str
    cgpa: float
    backlogs: int
    coding_skills: float
    dsa_score: float
    aptitude_score: float
    communication_skills: float
    ml_knowledge: float
    system_design: float
    internships: int
    projects_count: int
    certifications: int
    hackathons: int
    open_source_contributions: int
    extracurriculars: int

@app.post("/upload_resume")
async def upload_resume(file: UploadFile = File(...)):
    contents = await file.read()
    text = extract_text_from_pdf(contents)
    extracted_data = parse_resume_text(text)
    return {"status": "success", "data": extracted_data}

@app.post("/predict")
def predict_placement(data: StudentData):
    if not model_pipeline:
        return {"error": "Model not loaded on server."}

    input_data = data.dict()
    df_data = {k: [v] for k, v in input_data.items()}
    input_df = pd.DataFrame(df_data)

    prediction = int(model_pipeline.predict(input_df)[0])
    prediction_proba = float(model_pipeline.predict_proba(input_df)[0][1])

    # Explainable AI - Strengths & Weaknesses
    strong_areas = []
    needs_improvement = []

    if data.cgpa >= 8.5:
        strong_areas.append({"title": "Excellent CGPA", "desc": "Your academic performance is very strong."})
    elif data.cgpa < 7.0:
        needs_improvement.append({"title": "Low CGPA", "desc": "Focus on improving your academic score."})

    if data.projects_count >= 3:
        strong_areas.append({"title": "Strong Project Portfolio", "desc": "Good number of projects demonstrated."})
    else:
        needs_improvement.append({"title": "Build More Projects", "desc": "Try to complete at least 3 solid projects."})

    if data.internships >= 2:
        strong_areas.append({"title": "Solid Internship Experience", "desc": "Industry experience gives you an edge."})
    else:
        needs_improvement.append({"title": "Gain Internships", "desc": "Try to get some industry exposure."})

    if data.aptitude_score >= 80:
        strong_areas.append({"title": "High Aptitude Score", "desc": "Strong logical and quantitative reasoning."})
    elif data.aptitude_score < 70:
        needs_improvement.append({"title": "Improve Aptitude", "desc": "Practice more competitive programming and reasoning."})

    if data.ml_knowledge >= 7.0:
        strong_areas.append({"title": "Good ML Knowledge", "desc": "Valuable skill for modern tech roles."})

    if data.dsa_score < 6.0:
        needs_improvement.append({"title": "Enhance DSA Skills", "desc": "Data Structures are critical for coding rounds."})
        
    # Career Match Scoring (Heuristics based on skills)
    roles = []
    
    # SDE Match (Heavily prioritized)
    sde_raw = (data.coding_skills * 2.0) + (data.dsa_score * 2.5) + (data.system_design * 1.5) + (min(data.projects_count, 5) * 2.0)
    sde_max = (10 * 2.0) + (10 * 2.5) + (10 * 1.5) + (5 * 2.0)
    sde_score = int((sde_raw / sde_max) * 100)
    roles.append({"role": "Software Engineer", "match": max(10, min(sde_score + 10, 99))})  # Small +10 baseline boost for SDE
    
    # ML Engineer Match
    ml_raw = (data.ml_knowledge * 3.5) + (data.coding_skills * 1.0)
    ml_max = (10 * 3.5) + (10 * 1.0)
    ml_score = int((ml_raw / ml_max) * 100)
    roles.append({"role": "ML Engineer", "match": max(10, min(ml_score, 99))})
    
    # Data Analyst Match
    da_raw = (data.aptitude_score / 10 * 2.0) + (data.communication_skills * 1.0) + ((data.cgpa / 10) * 10 * 1.5)
    da_max = (10 * 2.0) + (10 * 1.0) + (10 * 1.5)
    da_score = int((da_raw / da_max) * 100)
    roles.append({"role": "Data Analyst", "match": max(10, min(da_score, 99))})
    
    # Business Analyst
    ba_raw = (data.communication_skills * 2.5) + (data.aptitude_score / 10 * 1.5) + (min(data.extracurriculars, 5) * 2.0)
    ba_max = (10 * 2.5) + (10 * 1.5) + (5 * 2.0)
    ba_score = int((ba_raw / ba_max) * 100)
    roles.append({"role": "Business Analyst", "match": max(10, min(ba_score, 99))})

    # Sort roles by match percentage descending
    roles = sorted(roles, key=lambda x: x["match"], reverse=True)

    return {
        "placed": prediction == 1,
        "probability": prediction_proba,
        "strong_areas": strong_areas[:4],
        "needs_improvement": needs_improvement[:4],
        "career_matches": roles
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
