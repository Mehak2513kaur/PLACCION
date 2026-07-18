# Placement Prediction Dashboard

This is a modern React web application with a FastAPI backend machine learning model to predict student placement probabilities.

## Prerequisites
- Python 3.10+
- Node.js & npm

## How to Run Locally

You will need to open **two separate terminal windows** (like PowerShell or Command Prompt).

### 1. Start the Backend (FastAPI Model)
Open your first terminal, navigate to this project folder, and run:
```powershell
# Activate the Python virtual environment
.\venv\Scripts\Activate.ps1

# Start the FastAPI server
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```
*The backend API will now be running on `http://localhost:8000`.*

### 2. Start the Frontend (React Dashboard)
Open your second terminal, navigate to the `frontend` folder inside this project, and run:
```powershell
# Navigate to the frontend directory
cd frontend

# Start the Vite development server
npm run dev
```
*The beautiful dashboard will now be running on `http://localhost:5173`.*

## Project Structure
- `/backend`: Contains the trained `best_model.pkl` and the `main.py` FastAPI server script.
- `/frontend`: Contains the Vite React UI source code (`src/App.jsx`, `src/App.css`).
- `/data`: Synthetic placement dataset used for model training.
- `train.py`: Script used to train the Scikit-learn machine learning pipelines.
