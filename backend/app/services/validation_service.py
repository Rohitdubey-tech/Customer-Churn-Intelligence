import pandas as pd

REQUIRED_COLUMNS = [
    'industry', 'customer_segment', 'contract_type', 'payment_method',
    'tenure_months', 'monthly_charges', 'total_charges', 'contract_licenses',
    'active_users', 'support_tickets_30d', 'sla_breaches_90d', 'nps_score',
    'last_login_days_ago', 'feature_usage_score', 'executive_sponsor_present',
    'discount_percentage', 'paperless_billing', 'auto_renewal'
]

VALID_CATEGORIES = {
    'industry': ['Enterprise Tech', 'Financial Services', 'Healthcare', 'E-Commerce', 'Logistics', 'Manufacturing', 'Professional Services'],
    'customer_segment': ['Enterprise', 'Mid-Market', 'SMB'],
    'contract_type': ['Month-to-Month', '1-Year Fixed', '2-Year Fixed', '3-Year Enterprise'],
    'payment_method': ['Auto-Invoice', 'Credit Card', 'ACH Direct Debit', 'Manual Wire']
}

class ValidationService:
    @staticmethod
    def validate_single_input(data: dict) -> tuple[bool, list[str]]:
        errors = []
        if not isinstance(data, dict):
            return False, ["Payload must be a JSON object."]

        for col in REQUIRED_COLUMNS:
            if col not in data or data[col] is None or data[col] == "":
                errors.append(f"Missing required field: '{col}'")

        if errors:
            return False, errors

        # Validate categorical values
        for cat_col, valid_vals in VALID_CATEGORIES.items():
            if data.get(cat_col) not in valid_vals:
                errors.append(f"Invalid category for '{cat_col}': '{data.get(cat_col)}'. Must be one of {valid_vals}")

        # Validate numeric ranges
        try:
            if float(data.get('tenure_months', 0)) < 0:
                errors.append("Field 'tenure_months' must be >= 0.")
            if float(data.get('monthly_charges', 0)) < 0:
                errors.append("Field 'monthly_charges' must be >= 0.")
            if not (1 <= float(data.get('nps_score', 1)) <= 10):
                errors.append("Field 'nps_score' must be between 1 and 10.")
        except (ValueError, TypeError):
            errors.append("Numerical fields contain invalid non-numeric values.")

        return len(errors) == 0, errors

    @staticmethod
    def validate_df_input(df: pd.DataFrame) -> tuple[bool, list[str]]:
        errors = []
        if df.empty:
            return False, ["Uploaded CSV dataset is empty."]

        missing_cols = [col for col in REQUIRED_COLUMNS if col not in df.columns]
        if missing_cols:
            errors.append(f"Missing required columns in CSV: {', '.join(missing_cols)}")
            return False, errors

        # Check for null values
        null_counts = df[REQUIRED_COLUMNS].isnull().sum()
        cols_with_nulls = null_counts[null_counts > 0]
        if not cols_with_nulls.empty:
            for col, count in cols_with_nulls.items():
                errors.append(f"Column '{col}' contains {count} missing/null values.")

        return len(errors) == 0, errors

validation_service = ValidationService()
