import os
from app import create_app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"Starting Explainable Churn Prediction Engine Backend API on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)
