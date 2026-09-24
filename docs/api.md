# REST API Specification

All API endpoints return JSON responses and standard HTTP status codes:
- `200 OK`: Request succeeded.
- `400 Bad Request`: Missing arguments or malformed JSON payload.
- `404 Not Found`: Account ID or feature symbol not found.
- `422 Unprocessable Entity`: Data validation failure (missing required columns/invalid categories).
- `500 Internal Server Error`: Server exception.
- `503 Service Unavailable`: Model artifacts uninitialized.

---

## 1. System & Analytics Endpoints

### `GET /api/health`
Checks API readiness and model artifact loading status.

**Sample Response:**
```json
{
  "model_loaded": true,
  "service": "Explainable Customer Churn Prediction Engine",
  "status": "healthy",
  "version": "1.0.0"
}
```

### `GET /api/analytics/executive`
Returns executive KPI metrics and distribution summaries.

---

## 2. Customer Directory Endpoints

### `GET /api/customers`
Returns paginated customer list with filter and sort parameters.

**Query Parameters:**
- `search` (string): Search by account ID or company name.
- `risk_level` (string): `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
- `segment` (string): `Enterprise`, `Mid-Market`, `SMB`.
- `contract_type` (string): `Month-to-Month`, `1-Year Fixed`, `2-Year Fixed`, `3-Year Enterprise`.
- `sort_by` (string): Default `churn_probability`.
- `order` (string): `desc` or `asc`.
- `page` (int): Page number (default 1).
- `limit` (int): Items per page (default 15).

### `GET /api/customers/<id>`
Returns account details for a given `account_id`.

### `GET /api/customers/<id>/explanation`
Computes local SHAP TreeExplainer contribution for an individual account.

**Sample Response:**
```json
{
  "account_id": "AC-1001",
  "company_name": "Apex Global",
  "churn_probability": 0.7832,
  "prediction": 1,
  "risk_level": "HIGH",
  "base_value": 0.1425,
  "summary": "The model predicted a 78.3% churn probability (HIGH risk)...",
  "increasing_risk_factors": [
    {
      "feature": "support_tickets_30d",
      "value": 8,
      "shap_value": 0.2854,
      "direction": "increases_risk"
    }
  ],
  "decreasing_risk_factors": [
    {
      "feature": "contract_type_3-Year Enterprise",
      "value": 0,
      "shap_value": -0.1245,
      "direction": "reduces_risk"
    }
  ]
}
```

---

## 3. Explainability Endpoints

### `GET /api/explainability/global`
Returns population-wide mean absolute SHAP values and beeswarm summary points.

### `GET /api/explainability/dependence/<feature_name>`
Returns pairs of feature values, SHAP values, and predicted churn probabilities across accounts for dependence scatter plotting.

---

## 4. Prediction Endpoints

### `POST /api/predict`
Runs single account prediction.

### `POST /api/upload`
Accepts multipart/form-data CSV upload, performs batch predictions, and returns scored accounts.
