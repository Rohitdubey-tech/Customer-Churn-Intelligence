import os

class Config:
    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    MODELS_DIR = os.path.join(BASE_DIR, 'models')
    DATA_DIR = os.path.join(BASE_DIR, 'data')
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max upload
    
    # Configurable Risk Thresholds
    RISK_THRESHOLDS = {
        'LOW': 0.30,
        'MEDIUM': 0.60,
        'HIGH': 0.80,
        'CRITICAL': 1.00
    }
