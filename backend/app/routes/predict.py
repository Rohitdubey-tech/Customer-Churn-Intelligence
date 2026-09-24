import os
import io
import pandas as pd
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from app.services.model_service import model_service
from app.services.validation_service import validation_service
from app.config import Config

predict_bp = Blueprint('predict', __name__)

@predict_bp.route('/predict', methods=['POST'])
def predict_single():
    payload = request.get_json()
    if not payload:
        return jsonify({"error": "INVALID_PAYLOAD", "message": "JSON body is required."}), 400

    is_valid, errors = validation_service.validate_single_input(payload)
    if not is_valid:
        return jsonify({
            "error": "Data Validation Failed",
            "details": errors
        }), 422

    try:
        res = model_service.predict_single(payload)
        return jsonify(res)
    except Exception as e:
        return jsonify({"error": "PREDICTION_FAILED", "message": str(e)}), 500

@predict_bp.route('/predict/batch', methods=['POST'])
def predict_batch():
    payload = request.get_json()
    if not isinstance(payload, list):
        return jsonify({"error": "INVALID_PAYLOAD", "message": "Expected a JSON array of accounts."}), 400

    df_input = pd.DataFrame(payload)
    is_valid, errors = validation_service.validate_df_input(df_input)
    if not is_valid:
        return jsonify({
            "error": "Batch Validation Failed",
            "details": errors
        }), 422

    try:
        df_results = model_service.predict_batch(df_input)
        return jsonify(df_results.to_dict(orient="records"))
    except Exception as e:
        return jsonify({"error": "BATCH_PREDICTION_FAILED", "message": str(e)}), 500

@predict_bp.route('/upload', methods=['POST'])
def upload_and_predict():
    if 'file' not in request.files:
        return jsonify({"error": "NO_FILE", "message": "No file uploaded in request."}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "NO_FILENAME", "message": "No file selected."}), 400

    if not file.filename.endswith('.csv'):
        return jsonify({"error": "INVALID_FILE_TYPE", "message": "Only CSV files are allowed."}), 400

    try:
        content = file.read().decode('utf-8')
        df = pd.read_csv(io.StringIO(content))

        is_valid, errors = validation_service.validate_df_input(df)
        if not is_valid:
            return jsonify({
                "error": "Uploaded CSV Validation Failed",
                "details": errors
            }), 422

        df_results = model_service.predict_batch(df)

        if 'account_id' not in df_results.columns:
            df_results['account_id'] = [f"BATCH-{i+1001}" for i in range(len(df_results))]

        output_cols = ['account_id', 'churn_probability', 'prediction', 'risk_level'] + [
            c for c in df_results.columns if c not in ['account_id', 'churn_probability', 'prediction', 'risk_level']
        ]
        
        return jsonify({
            "success": True,
            "filename": secure_filename(file.filename),
            "total_rows": len(df_results),
            "results": df_results[output_cols].to_dict(orient="records")
        })
    except Exception as e:
        return jsonify({"error": "CSV_PROCESSING_FAILED", "message": str(e)}), 500
