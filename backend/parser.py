import re
import PyPDF2
from io import BytesIO

def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        reader = PyPDF2.PdfReader(BytesIO(file_bytes))
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return ""

def parse_resume_text(text: str) -> dict:
    # Convert to lowercase for easier matching
    text_lower = text.lower()
    
    # 1. Extract CGPA
    cgpa = 0.0
    cgpa_match = re.search(r'(?:cgpa|gpa)[\s:=]*([0-9]\.[0-9]+)', text_lower)
    if cgpa_match:
        try:
            val = float(cgpa_match.group(1))
            if val <= 10.0:
                cgpa = val
        except:
            pass

    # 2. Extract Skills (Keyword matching)
    skill_keywords = {
        "python": 0, "java": 0, "c++": 0, "c": 0, "javascript": 0, "react": 0, "node": 0,
        "sql": 0, "mysql": 0, "mongodb": 0, "machine learning": 0, "deep learning": 0, "nlp": 0,
        "aws": 0, "cloud": 0, "docker": 0, "kubernetes": 0, "html": 0, "css": 0,
        "dsa": 0, "data structures": 0, "algorithms": 0
    }
    
    found_skills = []
    for skill in skill_keywords:
        # Regex to match whole words
        if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
            found_skills.append(skill)
            
    # Map to form fields
    coding_skills = 5.0
    if len(found_skills) >= 4:
        coding_skills = 9.0
    elif len(found_skills) >= 2:
        coding_skills = 7.0
        
    ml_keywords = ["machine learning", "deep learning", "nlp"]
    ml_knowledge = 8.5 if any(s in found_skills for s in ml_keywords) else 3.0
    
    # Generic Software Engineers might not write "DSA", so we give them a decent baseline if they have coding skills
    dsa_keywords = ["dsa", "data structures", "algorithms", "c++", "java"]
    if any(s in found_skills for s in dsa_keywords):
        dsa_score = 8.5
    else:
        # Boost DSA if they just have a lot of coding skills
        dsa_score = 7.0 if coding_skills >= 7.0 else 4.0
        
    system_design = 7.5 if any(s in found_skills for s in ["aws", "cloud", "docker", "kubernetes", "node", "sql"]) else 4.0

    # 3. Guess Counts
    project_count = len(re.findall(r'\b(?:project|projects|app|application|website|system)\b', text_lower))
    project_count = min(max(project_count // 2, 0), 5)  # Heuristic

    internship_count = len(re.findall(r'\b(?:internship|intern|internships|developer|engineer)\b', text_lower))
    internship_count = min(max(internship_count // 3, 0), 3)

    certifications = len(re.findall(r'\b(?:certification|certifications|certificate|course)\b', text_lower))
    certifications = min(max(certifications // 2, 0), 5)

    return {
        "cgpa": cgpa if cgpa > 0 else 7.5,
        "coding_skills": coding_skills,
        "ml_knowledge": ml_knowledge,
        "dsa_score": dsa_score,
        "system_design": system_design,
        "projects_count": project_count,
        "internships": internship_count,
        "certifications": certifications,
        "found_skills": [s.title() for s in found_skills]
    }
