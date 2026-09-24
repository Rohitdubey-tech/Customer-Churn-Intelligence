from flask import Blueprint, jsonify
from app.services.model_service import model_service
from app.services.analytics_service import analytics_service

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy" if model_service.is_loaded else "unhealthy",
        "service": "Explainable Customer Churn Prediction Engine",
        "version": "1.0.0",
        "model_loaded": model_service.is_loaded
    })

@health_bp.route('/analytics/executive', methods=['GET'])
def get_executive_analytics():
    try:
        data = analytics_service.get_executive_summary()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": "Failed to calculate executive analytics", "message": str(e)}), 500
