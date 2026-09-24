# System Architecture Documentation

## Overview

The **Explainable Customer Churn Prediction Engine** is built as an end-to-end enterprise Machine Learning & Explainable AI (XAI) product. It combines LightGBM gradient boosting with SHAP (SHapley Additive exPlanations) TreeExplainer to deliver transparent, actionable churn risk predictions.

## Architecture Diagram

```mermaid
flowchart TD
    subgraph Data & Pipeline Layer
        RAW[Raw Enterprise Churn CSV] --> PROC[ChurnDataProcessor & Feature Engineering]
        PROC --> TRAIN[LightGBM Classifier Training]
        TRAIN --> EVAL[Model Evaluation & Metrics]
        TRAIN --> SHAP_EXP[SHAP TreeExplainer Matrix Computation]
        EVAL --> ART[Model Artifacts: .pkl / .json / .npy]
        SHAP_EXP --> ART
    end

    subgraph Backend REST API Layer (Flask)
        ART --> MODEL_SVC[ModelService Artifact Loader]
        MODEL_SVC --> SHAP_SVC[SHAP Explainability Service]
        MODEL_SVC --> CUST_SVC[Customer Directory Service]
        MODEL_SVC --> VAL_SVC[Data Validation Service]
        MODEL_SVC --> ANALYTICS_SVC[Executive Analytics Service]

        SHAP_SVC --> API_EXPLAIN[/api/customers/:id/explanation & /api/explainability/global]
        CUST_SVC --> API_CUST[/api/customers]
        VAL_SVC --> API_PRED[/api/predict & /api/upload]
        ANALYTICS_SVC --> API_EXEC[/api/analytics/executive]
    end

    subgraph Frontend Layer (React + Vite + Tailwind)
        API_EXPLAIN --> FE_FORCE[SHAP Force Plot Dashboard]
        API_CUST --> FE_EXPLORE[Customer Explorer Table]
        API_PRED --> FE_BATCH[Batch CSV Prediction Engine]
        API_EXEC --> FE_OVERVIEW[Executive Overview Dashboard]
    end
```

## Core Components

### 1. Feature Engineering & Preprocessing (`app/services/data_processor.py`)
- Standardizes numerical features using `StandardScaler`.
- One-Hot encodes categorical attributes (`industry`, `customer_segment`, `contract_type`, `payment_method`).
- Engineers composite metrics: `support_ticket_rate`, `usage_per_license`, `charge_per_user`, `engagement_score`, `account_health_index`.

### 2. LightGBM Binary Classifier (`scripts/train_model.py`)
- Gradient boosting model trained with fixed seed (`random_state=42`).
- Evaluated on 20% held-out stratified test dataset.
- Exposes accuracy, precision, recall, F1, ROC-AUC, PR-AUC, confusion matrix, ROC curve, and PR curve data.

### 3. SHAP Explainability Engine (`app/services/shap_service.py`)
- Employs `shap.TreeExplainer` for exact tree path attribution.
- Calculates baseline expectation $E[f(x)]$ and individual feature SHAP values $\phi_i(x)$.
- Formulates non-causal human-readable explanations distinguishing feature value, SHAP contribution, and direction of impact.

### 4. Flask REST API (`app/routes/`)
- Provides endpoints for single predictions, batch CSV scoring, customer directory querying, local force plot explanations, global feature importance, and feature dependence scatter plots.

### 5. Interactive React Dashboard (`frontend/src/`)
- Sleek dark enterprise UI with glassmorphic cards, custom force plot visualizer, Recharts data visualizers, Risk badges, and CSV export.
