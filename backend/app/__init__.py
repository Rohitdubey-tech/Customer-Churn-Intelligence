import os
from flask import Flask, jsonify
from flask_cors import CORS
from app.config import Config

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable CORS for frontend Vite dev server (port 3000) and production origins
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Register blueprints
    from app.routes.health import health_bp
    from app.routes.model import model_bp
    from app.routes.customers import customers_bp
    from app.routes.explainability import explainability_bp
    from app.routes.predict import predict_bp

    app.register_blueprint(health_bp, url_prefix='/api')
    app.register_blueprint(model_bp, url_prefix='/api')
    app.register_blueprint(customers_bp, url_prefix='/api')
    app.register_blueprint(explainability_bp, url_prefix='/api')
    app.register_blueprint(predict_bp, url_prefix='/api')

    @app.route('/')
    @app.route('/health')
    def index():
        return jsonify({
            "status": "healthy",
            "service": "Customer Churn Intelligence API",
            "version": "1.0.0",
            "endpoints": {
                "health": "/api/health",
                "executive_analytics": "/api/analytics/executive",
                "model_metrics": "/api/model/metrics",
                "customers": "/api/customers",
                "predict": "/api/predict"
            }
        }), 200

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "NOT_FOUND", "message": "The requested API endpoint does not exist."}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "INTERNAL_SERVER_ERROR", "message": "An internal server error occurred."}), 500

    return app
