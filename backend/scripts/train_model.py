import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, precision_recall_curve, roc_curve, confusion_matrix,
    classification_report, auc
)
import lightgbm as lgb
import shap
import sys

# Ensure backend package can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.services.data_processor import ChurnDataProcessor

def train_and_evaluate_model():
    data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../data'))
    models_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../models'))
    os.makedirs(models_dir, exist_ok=True)
    
    csv_path = os.path.join(data_dir, 'enterprise_churn.csv')
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset not found at {csv_path}. Run generate_dataset.py first.")

    print("Step 1: Loading raw enterprise customer dataset...")
    df = pd.read_csv(csv_path)
    print(f"Dataset loaded: {df.shape[0]} accounts, {df.shape[1]} raw attributes.")

    # Validate target
    if 'churn' not in df.columns:
        raise KeyError("Target column 'churn' missing from dataset.")

    y = df['churn'].values
    X_raw = df.drop(columns=['churn'])

    print("Step 2: Performing feature engineering and preprocessing...")
    processor = ChurnDataProcessor()
    X_transformed = processor.fit_transform(X_raw)
    feature_names = processor.feature_names
    print(f"Engineered feature space size: {len(feature_names)} features.")

    print("Step 3: Splitting into train and test sets (80/20 stratified)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X_transformed, y, test_size=0.20, random_state=42, stratify=y
    )

    print("Step 4: Training LightGBM binary classifier...")
    lgbm = lgb.LGBMClassifier(
        n_estimators=250,
        learning_rate=0.03,
        num_leaves=31,
        max_depth=6,
        subsample=0.8,
        colsample_bytree=0.8,
        reg_alpha=0.1,
        reg_lambda=1.0,
        random_state=42,
        verbosity=-1
    )
    
    lgbm.fit(X_train, y_train)

    print("Step 5: Evaluating model performance on held-out test set...")
    y_pred = lgbm.predict(X_test)
    y_prob = lgbm.predict_proba(X_test)[:, 1]

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred))
    rec = float(recall_score(y_test, y_pred))
    f1 = float(f1_score(y_test, y_pred))
    roc_auc = float(roc_auc_score(y_test, y_prob))

    prec_array, rec_array, _ = precision_recall_curve(y_test, y_prob)
    pr_auc = float(auc(rec_array, prec_array))

    cm = confusion_matrix(y_test, y_pred).tolist()
    cls_report = classification_report(y_test, y_pred, output_dict=True)

    # ROC curve points (downsampled for clean API responses)
    fpr, tpr, roc_thresholds = roc_curve(y_test, y_prob)
    roc_points = [
        {"fpr": round(float(f), 4), "tpr": round(float(t), 4)}
        for f, t in zip(fpr[::max(1, len(fpr)//50)], tpr[::max(1, len(tpr)//50)])
    ]
    # Ensure end point
    if roc_points[-1] != {"fpr": 1.0, "tpr": 1.0}:
        roc_points.append({"fpr": 1.0, "tpr": 1.0})

    # PR curve points
    pr_points = [
        {"recall": round(float(r), 4), "precision": round(float(p), 4)}
        for p, r in zip(prec_array[::max(1, len(prec_array)//50)], rec_array[::max(1, len(rec_array)//50)])
    ]

    metrics = {
        "model_name": "LightGBM Binary Classifier",
        "dataset_size": int(len(df)),
        "train_size": int(len(X_train)),
        "test_size": int(len(X_test)),
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(roc_auc, 4),
        "pr_auc": round(pr_auc, 4),
        "confusion_matrix": cm,
        "classification_report": cls_report,
        "roc_curve": roc_points,
        "pr_curve": pr_points,
        "feature_importance": [
            {"feature": name, "importance": int(imp)}
            for name, imp in sorted(
                zip(feature_names, lgbm.feature_importances_),
                key=lambda x: x[1],
                reverse=True
            )
        ]
    }

    print(f"Model Metrics -> Accuracy: {acc:.4f}, F1: {f1:.4f}, ROC-AUC: {roc_auc:.4f}, PR-AUC: {pr_auc:.4f}")

    print("Step 6: Initializing SHAP TreeExplainer...")
    explainer = shap.TreeExplainer(lgbm)
    
    # Compute SHAP values for full transformed dataset
    shap_values = explainer.shap_values(X_transformed)
    if isinstance(shap_values, list):
        # binary classification return array for class 1
        shap_values_class1 = shap_values[1]
    else:
        shap_values_class1 = shap_values

    expected_value = float(explainer.expected_value[1] if isinstance(explainer.expected_value, (list, np.ndarray)) else explainer.expected_value)

    print("Step 7: Enriching full dataset with predictions and SHAP explanations...")
    full_probs = lgbm.predict_proba(X_transformed)[:, 1]
    
    def get_risk_level(prob):
        if prob < 0.30:
            return "LOW"
        elif prob < 0.60:
            return "MEDIUM"
        elif prob < 0.80:
            return "HIGH"
        else:
            return "CRITICAL"

    df_enriched = df.copy()
    df_engineered = processor.engineer_features(df)
    
    for col in processor.engineered_cols:
        df_enriched[col] = df_engineered[col]

    df_enriched['churn_probability'] = np.round(full_probs, 4)
    df_enriched['prediction'] = (full_probs >= 0.5).astype(int)
    df_enriched['risk_level'] = [get_risk_level(p) for p in full_probs]

    # Save serialized artifacts
    joblib.dump(lgbm, os.path.join(models_dir, 'lightgbm_model.pkl'))
    joblib.dump(processor, os.path.join(models_dir, 'preprocessor.pkl'))
    joblib.dump(feature_names, os.path.join(models_dir, 'feature_names.pkl'))
    joblib.dump(explainer, os.path.join(models_dir, 'shap_explainer.pkl'))
    
    # Also dump SHAP matrix and base value for fast runtime global & local caching
    np.save(os.path.join(models_dir, 'shap_values.npy'), shap_values_class1)
    
    with open(os.path.join(models_dir, 'metrics.json'), 'w') as f:
        json.dump(metrics, f, indent=2)

    with open(os.path.join(models_dir, 'shap_metadata.json'), 'w') as f:
        json.dump({
            "base_value": expected_value,
            "feature_names": feature_names
        }, f, indent=2)

    df_enriched.to_csv(os.path.join(models_dir, 'processed_data.csv'), index=False)
    print(f"All model artifacts successfully serialized to {models_dir}!")

if __name__ == '__main__':
    train_and_evaluate_model()
