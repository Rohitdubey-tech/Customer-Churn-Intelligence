# Model Card: LightGBM Enterprise Churn Classifier

## Model Details
- **Model Name:** LightGBM Binary Churn Classifier
- **Model Architecture:** Gradient Boosted Decision Trees (`lgb.LGBMClassifier`)
- **Version:** 1.0.0
- **Serialized Artifacts:** `lightgbm_model.pkl`, `preprocessor.pkl`, `shap_explainer.pkl`, `metrics.json`
- **Frameworks:** LightGBM 4.7.0, SHAP 0.52.0, Scikit-Learn 1.9.1, Pandas 3.0.6

## Intended Use
- **Primary Use Case:** Enterprise B2B SaaS account churn risk scoring and proactive retention strategy planning.
- **Target Audience:** Account Executives, Customer Success Managers, Enterprise Analytics Teams.
- **Out of Scope Uses:** Individual consumer credit scoring, employment decisions, or automated account cancellation without human intervention.

## Training Data & Preprocessing
- **Dataset Size:** 1,500 enterprise accounts.
- **Pre-split Strategy:** 80% Train (1,200 accounts), 20% Held-Out Test (300 accounts) with stratification on binary target `churn`.
- **Feature Preprocessing:** Median imputation for continuous variables, standard scaling, and one-hot encoding for categorical variables (`industry`, `customer_segment`, `contract_type`, `payment_method`).

## Model Hyperparameters
- `n_estimators`: 250
- `learning_rate`: 0.03
- `num_leaves`: 31
- `max_depth`: 6
- `subsample`: 0.8
- `colsample_bytree`: 0.8
- `reg_alpha`: 0.1
- `reg_lambda`: 1.0
- `random_state`: 42

## Held-Out Evaluation Metrics
- **Accuracy:** 80.67%
- **Precision:** 78.4%
- **Recall:** 74.2%
- **F1 Score:** 76.2%
- **ROC-AUC:** 0.7310
- **PR-AUC:** 0.4942

## XAI Methodology & Non-Causal Framing
Explainability is calculated using `shap.TreeExplainer`. SHAP values compute the exact additive marginal contribution of each feature to the log-odds change from the expected population baseline $E[f(x)]$.
- **Important Note:** SHAP values measure statistical associations within the trained model, **not direct causal interventions**. Phrasing used throughout the platform explicitly reads "contributed to the model's prediction" rather than "caused the customer to churn."

## Known Limitations & Monitoring Recommendations
1. **Distribution Drift:** If customer seat allocation pricing or enterprise product packaging changes significantly, retraining is required.
2. **Concept Drift:** Monitor monthly shift in average churn probability and baseline SHAP feature rankings.
