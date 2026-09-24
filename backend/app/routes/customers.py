from flask import Blueprint, request, jsonify
from app.services.customer_service import customer_service
from app.services.shap_service import shap_service

customers_bp = Blueprint('customers', __name__)

@customers_bp.route('/customers', methods=['GET'])
def get_customers():
    search = request.args.get('search', '', type=str)
    risk_level = request.args.get('risk_level', '', type=str)
    segment = request.args.get('segment', '', type=str)
    contract_type = request.args.get('contract_type', '', type=str)
    sort_by = request.args.get('sort_by', 'churn_probability', type=str)
    order = request.args.get('order', 'desc', type=str)
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 15, type=int)

    try:
        data = customer_service.get_customers(
            search=search,
            risk_level=risk_level,
            segment=segment,
            contract_type=contract_type,
            sort_by=sort_by,
            order=order,
            page=page,
            limit=limit
        )
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": "Failed to fetch customer directory", "message": str(e)}), 500

@customers_bp.route('/customers/<id>', methods=['GET'])
def get_customer_by_id(id):
    try:
        customer = customer_service.get_customer_by_id(id)
        return jsonify(customer)
    except KeyError as e:
        return jsonify({"error": "CUSTOMER_NOT_FOUND", "message": str(e)}), 404
    except Exception as e:
        return jsonify({"error": "Failed to fetch customer", "message": str(e)}), 500

@customers_bp.route('/customers/<id>/explanation', methods=['GET'])
def get_customer_explanation(id):
    top_n = request.args.get('top_n', 10, type=int)
    try:
        explanation = shap_service.get_local_explanation(id, top_n=top_n)
        return jsonify(explanation)
    except KeyError as e:
        return jsonify({"error": "CUSTOMER_NOT_FOUND", "message": str(e)}), 404
    except Exception as e:
        return jsonify({"error": "EXPLANATION_FAILED", "message": str(e)}), 500
