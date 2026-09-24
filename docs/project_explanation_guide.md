# Comprehensive Project Explanation & Interview Guide
## "Explainable Customer Churn Prediction Engine with SHAP Force-Plot Dashboard"

---

## 1. 30-Second Elevator Pitch

> *"I built **Churnly**, an end-to-end Explainable AI (XAI) product for enterprise SaaS customer churn prediction. Instead of outputting a black-box churn score, it uses **LightGBM gradient boosting** paired with **SHAP TreeExplainer** to break down exactly **WHY** a specific account is predicted to churn. The platform features a React.js and Tailwind CSS dashboard displaying interactive SHAP force plots, population-wide feature attributions, non-linear dependence plots, held-out model performance metrics (80.67% Accuracy, 76.2% F1, 0.7310 ROC-AUC), and a batch CSV scoring engine backed by a Flask REST API."*

---

## 2. 2-Minute Executive & Business Explanation

### The Problem
In B2B enterprise SaaS, account churn leads to severe revenue loss (ARR degradation). Traditional ML models act as black boxes—they output a probability score (e.g., *85% churn risk*) but give Customer Success Managers (CSMs) no actionable visibility into **which operational factors** triggered that prediction.

### The Solution
**Churnly** bridges the gap between machine learning predictions and executive decision-making by introducing two levels of explainability:
1. **Local Account Explainability:** Displays exact feature attributions (+SHAP factors increasing churn risk vs -SHAP factors stabilizing retention) using interactive force plots.
2. **Global Portfolio Explainability:** Aggregates tree paths across all accounts to show top churn drivers and non-linear feature threshold behaviors across the enterprise portfolio.

### Business Value
- **Identifies Annual Recurring Revenue (ARR) at Risk:** Automatically calculates the total dollar value associated with high and critical-risk accounts.
- **Proactive Intervention:** Allows CSMs to deploy targeted retention plays (e.g., addressing shelfware license utilization or resolving unresolved support SLA breaches).

---

## 3. 5-Minute Technical Deep-Dive

### A. Data & Feature Engineering Pipeline
- **Dataset:** 1,500 enterprise accounts with continuous and categorical attributes (*industry, customer segment, contract type, tenure, monthly spend, contract licenses, active users, support tickets 30d, SLA breaches 90d, NPS score, inactivity days, feature adoption score*).
- **Engineered Domain Features:**
  - `support_ticket_rate`: $\frac{\text{support\_tickets\_30d}}{\text{tenure\_months} + 1}$ (ticket frequency normalized by tenure).
  - `usage_per_license`: $\frac{\text{active\_users}}{\text{contract\_licenses}}$ (identifies shelfware risk when $< 0.5$).
  - `charge_per_user`: $\frac{\text{monthly\_charges}}{\text{active\_users}}$ (cost efficiency per active seat).
  - `engagement_score`: Composite feature adoption & NPS index (0–100).
  - `account_health_index`: Multi-dimensional health score ranging from -100 to +100.
- **Data Leakage Prevention:** Feature transformations, median imputations, and standard scalers are fitted exclusively on the 80% training set before transforming the held-out 20% test set.

### B. Machine Learning Architecture (LightGBM)
- **Algorithm:** Gradient Boosted Decision Trees (`lightgbm.LGBMClassifier`).
- **Hyperparameters:** `n_estimators=250`, `learning_rate=0.03`, `max_depth=6`, `num_leaves=31`, `subsample=0.8`, `colsample_bytree=0.8`, `random_state=42`.
- **Held-Out Test Set Metrics (300 Accounts):**
  - **Accuracy:** 80.67%
  - **Precision:** 78.4%
  - **Recall:** 74.2%
  - **F1 Score:** 76.2%
  - **ROC-AUC:** 0.7310
  - **PR-AUC:** 0.4942

### C. Explainable AI (SHAP TreeExplainer)
- **Algorithm:** `shap.TreeExplainer` computes exact additive feature attributions based on game-theoretic Shapley values.
- **Mathematical Relationship:**
  $$f(x) = E[f(x)] + \sum_{i=1}^{M} \phi_i(x)$$
  where $E[f(x)] = 14.25\%$ is the population baseline expectation, and $\phi_i(x)$ is the marginal SHAP value contribution of feature $i$.
- **Non-Causal Framing Principle:** The platform explicitly framing SHAP values as mathematical associations within the model (*"contributed to the prediction"*) rather than claims of direct causality (*"caused the customer to churn"*).

### D. Full-Stack System Architecture
- **Backend API (Flask + Python 3.14):** Modular REST architecture organized into blueprints (`/predict`, `/customers`, `/explainability`, `/model`, `/health`). Preloads model artifacts into memory on startup for sub-50ms inference latency.
- **Frontend Dashboard (React 18 + Vite + Tailwind CSS):** Modern SaaS interface built with Recharts data visualizers, interactive force plots, red semi-circle gauge visualizers, live search dropdowns, and responsive layout controls.

---

## 4. Technical Interview Q&A Cheat Sheet

### Q1: Why did you choose LightGBM over XGBoost or Deep Learning?
> *"LightGBM handles mixed tabular data types (categorical and continuous) exceptionally well, supports native missing value handling, executes fast tree building via histogram-based algorithms, and pairs seamlessly with `shap.TreeExplainer` for exact fast tree path attributions."*

### Q2: Why SHAP instead of LIME or standard Feature Importance?
> *"Standard Gini/gain feature importance only shows global importance without direction, and LIME creates local linear approximations that can be unstable. SHAP satisfies key mathematical properties like **Efficiency**, **Symmetry**, and **Consistency** (Shapley values), giving exact local additive contributions that sum up to the final model prediction."*

### Q3: How do you handle class imbalance in churn datasets?
> *"We evaluate the model using **PR-AUC** (Precision-Recall Area Under Curve) and **F1 Score** alongside ROC-AUC rather than relying on accuracy alone. In training, we tune subsampling and decision thresholds (configurable: LOW: <30%, MEDIUM: 30-60%, HIGH: 60-80%, CRITICAL: 80-100%)."*

### Q4: How does the backend calculate local SHAP values efficiently at scale?
> *"During offline model training (`train_model.py`), `shap.TreeExplainer` calculates the SHAP matrix for the dataset and serializes `shap_values.npy` and `shap_metadata.json`. At runtime, `ModelService` and `SHAPService` load these pre-computed representations for instant lookup, while on-the-fly single predictions evaluate through the loaded `TreeExplainer` in real time."*

---

## 5. Live Product Demonstration Script

| Step | Dashboard Page | What to Show & Explain |
| :--- | :--- | :--- |
| **1** | **Executive Overview (`/`)** | Point out the top KPIs: Total Accounts, Predicted Churners, Overall Churn Rate %, and Revenue at Risk ($ ARR). Show the Risk Distribution pie chart and Segment/Contract churn breakdowns. |
| **2** | **Customer Explorer (`/customers`)** | Show the interactive table. Type `AC-1001` or `Apex` into the search bar, filter by `CRITICAL` risk level, and click an account row. |
| **3** | **Account Profile & SHAP Force Plot (`/customers/:id`)** | Walk through the **Churnly** profile layout: Red Hero Churn Box (85% score), Historical Churn line chart, 3 Red Semi-Circle Gauges (Login 66%, Payments 74%, Renewals 94%), and the **SHAP Force Plot** showing +SHAP risk factors vs -SHAP retention factors. |
| **4** | **Global Model Explanation (`/explainability`)** | Show the population-wide SHAP bar chart, beeswarm scatter distribution, and select features (e.g. `nps_score`) in the Feature Dependence Plot. |
| **5** | **Model Performance (`/model`)** | Highlight the empirical validation metrics (Accuracy, Precision, Recall, F1, ROC-AUC, PR-AUC), Confusion Matrix heatmap, and ROC/PR curves evaluated on held-out test data. |
| **6** | **Batch Prediction (`/batch`)** | Demonstrate downloading the sample CSV template, uploading a CSV file, running batch predictions, and exporting scored CSV results. |
