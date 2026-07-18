import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib
import os

# Load Data
data_path = "data/student_placement_synthetic.csv"
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

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

print("Tuning and training models to maximize accuracy...\n")

# Process the data for tuning
X_train_prep = preprocessor.fit_transform(X_train)
X_test_prep = preprocessor.transform(X_test)

# Tuned XGBoost
xgb_params = {
    'learning_rate': [0.01, 0.05, 0.1, 0.2],
    'max_depth': [3, 5, 7, 9],
    'n_estimators': [100, 200, 300, 500],
    'subsample': [0.8, 0.9, 1.0]
}
xgb = XGBClassifier(use_label_encoder=False, eval_metric='logloss', random_state=42)
xgb_search = RandomizedSearchCV(xgb, xgb_params, n_iter=10, cv=3, scoring='accuracy', n_jobs=-1, random_state=42)
xgb_search.fit(X_train_prep, y_train)

# Tuned Random Forest
rf_params = {
    'n_estimators': [100, 200, 300],
    'max_depth': [10, 20, 30, None],
    'min_samples_split': [2, 5, 10]
}
rf = RandomForestClassifier(random_state=42)
rf_search = RandomizedSearchCV(rf, rf_params, n_iter=10, cv=3, scoring='accuracy', n_jobs=-1, random_state=42)
rf_search.fit(X_train_prep, y_train)

# Create an Ensemble Model (Voting Classifier)
ensemble = VotingClassifier(
    estimators=[
        ('tuned_xgb', xgb_search.best_estimator_),
        ('tuned_rf', rf_search.best_estimator_)
    ],
    voting='soft'
)

# Full Pipeline
best_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('classifier', ensemble)
])

# Final Evaluation
best_pipeline.fit(X_train, y_train)
y_pred = best_pipeline.predict(X_test)

acc = accuracy_score(y_test, y_pred)
prec = precision_score(y_test, y_pred)
rec = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)

print(f"--- Enhanced Ensemble Model ---")
print(f"Accuracy:  {acc:.4f}")
print(f"Precision: {prec:.4f}")
print(f"Recall:    {rec:.4f}")
print(f"F1 Score:  {f1:.4f}\n")

# Save the best model
models_dir = "models"
if not os.path.exists(models_dir):
    os.makedirs(models_dir)

model_path = os.path.join(models_dir, "best_model.pkl")
joblib.dump(best_pipeline, model_path)
print(f"Highly accurate ensemble model saved to {model_path}")
