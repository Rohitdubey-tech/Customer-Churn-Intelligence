import pandas as pd
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline

CATEGORICAL_FEATURES = ['industry', 'customer_segment', 'contract_type', 'payment_method']

NUMERICAL_FEATURES = [
    'tenure_months', 'monthly_charges', 'total_charges',
    'contract_licenses', 'active_users', 'support_tickets_30d',
    'sla_breaches_90d', 'nps_score', 'last_login_days_ago',
    'feature_usage_score', 'executive_sponsor_present',
    'discount_percentage', 'paperless_billing', 'auto_renewal'
]

ENGINEERED_FEATURES = [
    'support_ticket_rate',
    'usage_per_license',
    'charge_per_user',
    'engagement_score',
    'account_health_index'
]

class ChurnDataProcessor:
    def __init__(self):
        self.pipeline = None
        self.feature_names = []
        self.categorical_cols = CATEGORICAL_FEATURES
        self.raw_numerical_cols = NUMERICAL_FEATURES
        self.engineered_cols = ENGINEERED_FEATURES

    def engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Adds domain-specific engineered features to the dataset."""
        df = df.copy()
        
        # 1. Support ticket rate per month of tenure
        df['support_ticket_rate'] = np.round(df['support_tickets_30d'] / (df['tenure_months'] + 1), 4)
        
        # 2. License utilization ratio
        df['usage_per_license'] = np.round(df['active_users'] / (df['contract_licenses'] + 1e-5), 4)
        df['usage_per_license'] = np.clip(df['usage_per_license'], 0.0, 1.5)
        
        # 3. Monthly charge per active user
        df['charge_per_user'] = np.round(df['monthly_charges'] / (df['active_users'] + 1e-5), 2)
        df['charge_per_user'] = np.clip(df['charge_per_user'], 0.0, 10000.0)
        
        # 4. Composite engagement score (0-100)
        engagement = (df['feature_usage_score'] * 0.6) + (df['nps_score'] * 10 * 0.4)
        df['engagement_score'] = np.round(np.clip(engagement, 0.0, 100.0), 2)
        
        # 5. Composite account health index (-100 to 100+)
        health = (
            (df['nps_score'] * 8) 
            - (df['last_login_days_ago'] * 1.5) 
            - (df['sla_breaches_90d'] * 10) 
            + (df['executive_sponsor_present'] * 15)
            + (df['usage_per_license'] * 20)
        )
        df['account_health_index'] = np.round(health, 2)
        
        return df

    def fit_transform(self, df: pd.DataFrame):
        """Engineers features and fits the Scikit-Learn preprocessing pipeline."""
        df_engineered = self.engineer_features(df)
        
        all_numeric = self.raw_numerical_cols + self.engineered_cols
        
        numeric_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler())
        ])
        
        categorical_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='most_frequent')),
            ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
        ])
        
        self.pipeline = ColumnTransformer(
            transformers=[
                ('num', numeric_transformer, all_numeric),
                ('cat', categorical_transformer, self.categorical_cols)
            ]
        )
        
        X_transformed = self.pipeline.fit_transform(df_engineered)
        
        # Extract transformed feature names
        cat_ohe = self.pipeline.named_transformers_['cat'].named_steps['onehot']
        ohe_cols = list(cat_ohe.get_feature_names_out(self.categorical_cols))
        self.feature_names = all_numeric + ohe_cols
        
        return pd.DataFrame(X_transformed, columns=self.feature_names)

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """Transforms new input data using the fitted pipeline."""
        if self.pipeline is None:
            raise ValueError("DataProcessor is not fitted yet.")
            
        df_engineered = self.engineer_features(df)
        X_transformed = self.pipeline.transform(df_engineered)
        return pd.DataFrame(X_transformed, columns=self.feature_names)
