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

# Load Model or Train Fallback
model_path = os.path.join(os.path.dirname(__file__), "..", "models", "best_model.pkl")
try:
    model_pipeline = joblib.load(model_path)
    print("Successfully loaded pre-trained model.")
except Exception as e:
    print(f"Pre-trained model not found. Training a quick fallback model on the fly...")
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.pipeline import Pipeline
    from sklearn.compose import ColumnTransformer
    from sklearn.preprocessing import StandardScaler, OneHotEncoder
    
    data_path = os.path.join(os.path.dirname(__file__), "..", "data", "student_placement_synthetic.csv")
    if os.path.exists(data_path):
        df = pd.read_csv(data_path)
        if 'salary_package_lpa' in df.columns:
            df.drop('salary_package_lpa', axis=1, inplace=True)
            
        X = df.drop('placement_status', axis=1)
        y = df['placement_status']
        
        categorical_cols = X.select_dtypes(include=['object', 'category']).columns.tolist()
        numerical_cols = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
        
        preprocessor = ColumnTransformer(
            transformers=[
                ('num', StandardScaler(), numerical_cols),
                ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_cols)
            ])
            
        rf = RandomForestClassifier(n_estimators=50, max_depth=10, random_state=42)
        
        model_pipeline = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('classifier', rf)
        ])
        
        model_pipeline.fit(X, y)
        print("Fallback model trained successfully!")
    else:
        print("Dataset not found. Cannot train fallback model.")
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
    certifications: int = 1
    hackathons: int = 0
    open_source_contributions: int = 0
    extracurriculars: int = 0
    # Extended 50-field parameters
    tenth_percentage: float = 80.0
    twelfth_percentage: float = 80.0
    leetcode_solved: int = 0
    python: bool = False
    java: bool = False
    cpp: bool = False
    react: bool = False
    devops: bool = False
    sql: bool = False
    teamwork_rating: float = 7.0
    problem_solving_rating: float = 7.0

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

    # Extract ONLY the 16 features the ML model was trained on to prevent crashes
    model_features = [
        "branch", "college_tier", "cgpa", "backlogs", "coding_skills", "dsa_score", 
        "aptitude_score", "communication_skills", "ml_knowledge", "system_design", 
        "internships", "projects_count", "certifications", "hackathons", 
        "open_source_contributions", "extracurriculars"
    ]
    
    input_data = {k: getattr(data, k) for k in model_features}
    df_data = {k: [v] for k, v in input_data.items()}
    input_df = pd.DataFrame(df_data)

    prediction = int(model_pipeline.predict(input_df)[0])
    prediction_proba = float(model_pipeline.predict_proba(input_df)[0][1])

    # Explainable AI - Strengths & Weaknesses
    strong_areas = []
    needs_improvement = []

    # New 50-field Advanced Heuristics
    if data.leetcode_solved >= 100:
        strong_areas.append({"title": "Competitive Programming", "desc": f"Outstanding! Solved {data.leetcode_solved} LeetCode problems."})
    
    tech_stack = [t.capitalize() for t, v in zip(['python','java','cpp','react','devops','sql'], [data.python, data.java, data.cpp, data.react, data.devops, data.sql]) if v]
    if len(tech_stack) > 2:
        strong_areas.append({"title": "Diverse Tech Stack", "desc": f"Strong knowledge across {', '.join(tech_stack)}."})
    elif len(tech_stack) > 0:
        strong_areas.append({"title": "Core Technical Skills", "desc": f"Proficient in {', '.join(tech_stack)}."})
        
    if data.teamwork_rating >= 8.5:
        strong_areas.append({"title": "Excellent Teamwork", "desc": "Highly collaborative and team-oriented."})
        
    if data.tenth_percentage < 70 or data.twelfth_percentage < 70:
        needs_improvement.append({"title": "Past Academics", "desc": "Pre-college academic scores are below average."})

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
