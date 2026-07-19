import streamlit as st
import pandas as pd
import joblib

st.set_page_config(page_title="Student Placement Predictor", layout="centered", initial_sidebar_state="auto")

st.title("🎓 Student Placement Predictor")
st.markdown("Enter the student's details below to predict their placement probability.")

# Load the saved model pipeline
@st.cache_resource
def load_model():
    return joblib.load("models/best_model.pkl")

try:
    model_pipeline = load_model()
except Exception as e:
    st.error(f"Failed to load model. Please make sure to run train.py first.\nError: {e}")
    st.stop()

from backend.parser import extract_text_from_pdf, parse_resume_text

# Input fields
st.header("📄 Auto-fill with Resume (Optional)")
uploaded_file = st.file_uploader("Upload your resume (PDF) to automatically fill the fields below:", type=["pdf"])

parsed_data = {}
if uploaded_file is not None:
    try:
        text = extract_text_from_pdf(uploaded_file.read())
        parsed_data = parse_resume_text(text)
        st.success(f"Resume parsed successfully! Found skills: {', '.join(parsed_data.get('found_skills', []))}")
    except Exception as e:
        st.error(f"Error parsing resume: {e}")

st.divider()

col1, col2 = st.columns(2)

with col1:
    branch = st.selectbox("Branch", ["CSE", "IT", "ECE", "EE", "CE", "ME", "Chemical", "Civil", "Other"])
    college_tier = st.selectbox("College Tier", ["Tier-1", "Tier-2", "Tier-3"])
    cgpa = st.slider("CGPA", 0.0, 10.0, float(parsed_data.get("cgpa", 7.5)), 0.1)
    backlogs = st.number_input("Number of Backlogs", min_value=0, max_value=10, value=0)
    coding_skills = st.slider("Coding Skills (0-10)", 0.0, 10.0, float(parsed_data.get("coding_skills", 5.0)), 0.1)
    dsa_score = st.slider("DSA Score (0-10)", 0.0, 10.0, float(parsed_data.get("dsa_score", 5.0)), 0.1)
    aptitude_score = st.slider("Aptitude Score (0-100)", 0.0, 100.0, 60.0, 0.5)

with col2:
    communication_skills = st.slider("Communication Skills (0-10)", 0.0, 10.0, 6.0, 0.1)
    ml_knowledge = st.slider("ML Knowledge (0-10)", 0.0, 10.0, float(parsed_data.get("ml_knowledge", 3.0)), 0.1)
    system_design = st.slider("System Design Knowledge (0-10)", 0.0, 10.0, float(parsed_data.get("system_design", 3.0)), 0.1)
    internships = st.number_input("Number of Internships", min_value=0, max_value=10, value=int(parsed_data.get("internships", 1)))
    projects_count = st.number_input("Number of Projects", min_value=0, max_value=15, value=int(parsed_data.get("projects_count", 2)))
    certifications = st.number_input("Number of Certifications", min_value=0, max_value=20, value=int(parsed_data.get("certifications", 0)))
    hackathons = st.number_input("Number of Hackathons Participated", min_value=0, max_value=15, value=0)

col3, col4 = st.columns(2)
with col3:
    open_source = st.number_input("Open Source Contributions", min_value=0, max_value=50, value=0)
with col4:
    extracurriculars = st.selectbox("Extracurricular Activities", [0, 1], format_func=lambda x: "Yes" if x == 1 else "No")

# Prediction
if st.button("Predict Placement Status", type="primary"):
    # Create input dataframe
    input_data = {
        'branch': [branch],
        'college_tier': [college_tier],
        'cgpa': [cgpa],
        'backlogs': [backlogs],
        'coding_skills': [coding_skills],
        'dsa_score': [dsa_score],
        'aptitude_score': [aptitude_score],
        'communication_skills': [communication_skills],
        'ml_knowledge': [ml_knowledge],
        'system_design': [system_design],
        'internships': [internships],
        'projects_count': [projects_count],
        'certifications': [certifications],
        'hackathons': [hackathons],
        'open_source_contributions': [open_source],
        'extracurriculars': [extracurriculars]
    }
    
    input_df = pd.DataFrame(input_data)
    
    # Predict
    prediction = model_pipeline.predict(input_df)[0]
    prediction_proba = model_pipeline.predict_proba(input_df)[0][1]
    
    st.divider()
    
    if prediction == 1:
        st.success(f"🎉 **High Chance of Placement!** (Probability: {prediction_proba:.2%})")
        st.balloons()
    else:
        st.error(f"⚠️ **Low Chance of Placement.** (Probability: {prediction_proba:.2%})")
        st.info("Consider improving your coding skills, doing more projects, or participating in hackathons.")
