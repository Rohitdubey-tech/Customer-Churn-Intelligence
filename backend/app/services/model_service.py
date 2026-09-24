import os
import json
import joblib
import numpy as np
import pandas as pd
from app.config import Config
from app.services.data_processor import ChurnDataProcessor

class ModelService:
    def __init__(self):
        self.model = None
        self.preprocessor = None
        self.feature_names = None
        self.explainer = None
        self.metrics = None
        self.processed_df = None
        self.shap_values_matrix = None
        self.shap_base_value = 0.0
        self.is_loaded = False
        self.load_artifacts()

    def load_artifacts(self):
        models_dir = Config.MODELS_DIR
        model_path = os.path.join(models_dir, 'lightgbm_model.pkl')
        preprocessor_path = os.path.join(models_dir, 'preprocessor.pkl')
        feature_names_path = os.path.join(models_dir, 'feature_names.pkl')
        explainer_path = os.path.join(models_dir, 'shap_explainer.pkl')
        metrics_path = os.path.join(models_dir, 'metrics.json')
        processed_data_path = os.path.join(models_dir, 'processed_data.csv')
        shap_values_path = os.path.join(models_dir, 'shap_values.npy')
        shap_meta_path = os.path.join(models_dir, 'shap_metadata.json')

        if not all(os.path.exists(p) for p in [model_path, preprocessor_path, feature_names_path, metrics_path]):
            print("Warning: Model artifacts missing. API predictions will be unavailable until trained.")
            return

        try:
            self.model = joblib.load(model_path)
            self.preprocessor = joblib.load(preprocessor_path)
            self.feature_names = joblib.load(feature_names_path)
            
            if os.path.exists(explainer_path):
                self.explainer = joblib.load(explainer_path)
                
            with open(metrics_path, 'r') as f:
                self.metrics = json.load(f)

            if os.path.exists(shap_meta_path):
                with open(shap_meta_path, 'r') as f:
                    meta = json.load(f)
                    self.shap_base_value = float(meta.get('base_value', 0.0))

            if os.path.exists(processed_data_path):
                self.processed_df = pd.read_csv(processed_data_path)

            if os.path.exists(shap_values_path):
                self.shap_values_matrix = np.load(shap_values_path)

            self.is_loaded = True
            print("ModelService successfully initialized and loaded all model artifacts.")
        except Exception as e:
            print(f"Error loading model artifacts: {e}")
            self.is_loaded = False

    def calculate_risk_level(self, prob: float) -> str:
        thresholds = Config.RISK_THRESHOLDS
        if prob < thresholds['LOW']:
            return "LOW"
        elif prob < thresholds['MEDIUM']:
            return "MEDIUM"
        elif prob < thresholds['HIGH']:
            return "HIGH"
        else:
            return "CRITICAL"

    def predict_single(self, input_dict: dict) -> dict:
        if not self.is_loaded:
            raise RuntimeError("Model artifacts are not loaded.")

        df_input = pd.DataFrame([input_dict])
        
        # Preprocess input using fitted processor
        X_trans = self.preprocessor.transform(df_input)
        
        prob = float(self.model.predict_proba(X_trans)[0, 1])
        prediction = int(prob >= 0.5)
        risk_level = self.calculate_risk_level(prob)

        account_id = input_dict.get('account_id', 'CUSTOM_PRED')

        return {
            "account_id": account_id,
            "churn_probability": round(prob, 4),
            "prediction": prediction,
            "risk_level": risk_level,
            "thresholds_used": Config.RISK_THRESHOLDS
        }

    def predict_batch(self, df_input: pd.DataFrame) -> pd.DataFrame:
        if not self.is_loaded:
            raise RuntimeError("Model artifacts are not loaded.")

        df_work = df_input.copy()
        
        X_trans = self.preprocessor.transform(df_work)
        probs = self.model.predict_proba(X_trans)[:, 1]
        
        df_work['churn_probability'] = np.round(probs, 4)
        df_work['prediction'] = (probs >= 0.5).astype(int)
        df_work['risk_level'] = [self.calculate_risk_level(p) for p in probs]

        return df_work

model_service = ModelService()
