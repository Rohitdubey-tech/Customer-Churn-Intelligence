from flask import Blueprint, jsonify
from app.services.model_service import model_service

model_bp = Blueprint('model', __name__)

@model_bp.route('/model/metrics', methods=['GET'])
def get_metrics():
    if not model_service.is_loaded or model_service.metrics is None:
        return jsonify({"error": "MODEL_NOT_FOUND", "message": "Model metrics are unavailable."}), 503

    return jsonify(model_service.metrics)

@model_bp.route('/model/features', methods=['GET'])
def get_features():
    if not model_service.is_loaded or model_service.feature_names is None:
        return jsonify({"error": "MODEL_NOT_FOUND", "message": "Model features are unavailable."}), 503

    return jsonify({
        "total_features": len(model_service.feature_names),
        "features": model_service.feature_names
    })
