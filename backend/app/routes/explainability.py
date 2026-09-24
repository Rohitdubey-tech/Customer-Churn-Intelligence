from flask import Blueprint, jsonify, request
from app.services.shap_service import shap_service

explainability_bp = Blueprint('explainability', __name__)

@explainability_bp.route('/explainability/global', methods=['GET'])
def get_global_explanation():
    try:
        data = shap_service.get_global_explainability()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": "GLOBAL_EXPLANATION_FAILED", "message": str(e)}), 500

@explainability_bp.route('/explainability/dependence/<feature_name>', methods=['GET'])
def get_feature_dependence(feature_name):
    try:
        data = shap_service.get_feature_dependence(feature_name)
        return jsonify(data)
    except KeyError as e:
        return jsonify({"error": "FEATURE_NOT_FOUND", "message": str(e)}), 404
    except Exception as e:
        return jsonify({"error": "DEPENDENCE_ANALYSIS_FAILED", "message": str(e)}), 500
