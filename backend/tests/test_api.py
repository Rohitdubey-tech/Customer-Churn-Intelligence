import os
import sys
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app import create_app

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health_endpoint(client):
    response = client.get('/api/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'healthy'
    assert data['model_loaded'] is True

def test_model_metrics(client):
    response = client.get('/api/model/metrics')
    assert response.status_code == 200
    data = response.get_json()
    assert 'accuracy' in data
    assert 'f1_score' in data
    assert 'roc_auc' in data

def test_get_customers(client):
    response = client.get('/api/customers?limit=5')
    assert response.status_code == 200
    data = response.get_json()
    assert 'customers' in data
    assert len(data['customers']) == 5

def test_customer_explanation(client):
    response = client.get('/api/customers/AC-1001/explanation')
    assert response.status_code == 200
    data = response.get_json()
    assert data['account_id'] == 'AC-1001'
    assert 'churn_probability' in data
    assert 'top_features' in data
    assert 'increasing_risk_factors' in data
    assert 'decreasing_risk_factors' in data

def test_global_explainability(client):
    response = client.get('/api/explainability/global')
    assert response.status_code == 200
    data = response.get_json()
    assert 'global_importance' in data
    assert 'beeswarm_data' in data

def test_predict_single(client):
    payload = {
        "account_id": "TEST-999",
        "industry": "Enterprise Tech",
        "customer_segment": "Enterprise",
        "contract_type": "Month-to-Month",
        "payment_method": "Credit Card",
        "tenure_months": 3,
        "monthly_charges": 1850.0,
        "total_charges": 5550.0,
        "contract_licenses": 100,
        "active_users": 20,
        "support_tickets_30d": 8,
        "sla_breaches_90d": 3,
        "nps_score": 3,
        "last_login_days_ago": 14,
        "feature_usage_score": 35.0,
        "executive_sponsor_present": 0,
        "discount_percentage": 0,
        "paperless_billing": 1,
        "auto_renewal": 0
    }
    response = client.post('/api/predict', json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert 'churn_probability' in data
    assert 'risk_level' in data
