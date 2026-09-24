import numpy as np
import pandas as pd
from app.services.model_service import model_service

class AnalyticsService:
    def get_executive_summary(self) -> dict:
        if not model_service.is_loaded or model_service.processed_df is None:
            raise RuntimeError("Dataset not loaded for analytics.")

        df = model_service.processed_df

        total_accounts = len(df)
        predicted_churners = int(df['prediction'].sum())
        churn_rate = round(predicted_churners / total_accounts, 4) if total_accounts > 0 else 0.0

        high_risk_count = int((df['risk_level'].isin(['HIGH', 'CRITICAL'])).sum())
        avg_prob = round(float(df['churn_probability'].mean()), 4)

        # Revenue at risk: sum of annual charges for HIGH & CRITICAL risk accounts
        at_risk_df = df[df['risk_level'].isin(['HIGH', 'CRITICAL'])]
        revenue_at_risk_monthly = float(at_risk_df['monthly_charges'].sum())
        revenue_at_risk_annual = round(revenue_at_risk_monthly * 12, 2)
        total_arr = round(float(df['monthly_charges'].sum()) * 12, 2)

        # Risk distribution
        risk_counts = df['risk_level'].value_counts().to_dict()
        risk_distribution = [
            {
                "risk_level": level,
                "count": int(risk_counts.get(level, 0)),
                "percentage": round(int(risk_counts.get(level, 0)) / total_accounts * 100, 1)
            }
            for level in ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
        ]

        # Churn by Customer Segment
        segment_stats = df.groupby('customer_segment').agg(
            total_accounts=('account_id', 'count'),
            predicted_churn=('prediction', 'sum'),
            avg_prob=('churn_probability', 'mean'),
            monthly_revenue=('monthly_charges', 'sum')
        ).reset_index()

        segment_breakdown = [
            {
                "segment": row['customer_segment'],
                "total_accounts": int(row['total_accounts']),
                "predicted_churn": int(row['predicted_churn']),
                "churn_rate": round(row['predicted_churn'] / row['total_accounts'], 4),
                "avg_probability": round(float(row['avg_prob']), 4),
                "annual_revenue": round(float(row['monthly_revenue']) * 12, 2)
            }
            for _, row in segment_stats.iterrows()
        ]

        # Churn by Contract Type
        contract_stats = df.groupby('contract_type').agg(
            total_accounts=('account_id', 'count'),
            predicted_churn=('prediction', 'sum'),
            avg_prob=('churn_probability', 'mean')
        ).reset_index()

        contract_breakdown = [
            {
                "contract_type": row['contract_type'],
                "total_accounts": int(row['total_accounts']),
                "predicted_churn": int(row['predicted_churn']),
                "churn_rate": round(row['predicted_churn'] / row['total_accounts'], 4),
                "avg_probability": round(float(row['avg_prob']), 4)
            }
            for _, row in contract_stats.iterrows()
        ]

        # Churn by Industry
        industry_stats = df.groupby('industry').agg(
            total_accounts=('account_id', 'count'),
            predicted_churn=('prediction', 'sum'),
            avg_prob=('churn_probability', 'mean')
        ).reset_index()

        industry_breakdown = [
            {
                "industry": row['industry'],
                "total_accounts": int(row['total_accounts']),
                "predicted_churn": int(row['predicted_churn']),
                "churn_rate": round(row['predicted_churn'] / row['total_accounts'], 4),
                "avg_probability": round(float(row['avg_prob']), 4)
            }
            for _, row in industry_stats.iterrows()
        ]

        return {
            "total_accounts": total_accounts,
            "predicted_churners": predicted_churners,
            "churn_rate": churn_rate,
            "high_risk_count": high_risk_count,
            "average_churn_probability": avg_prob,
            "total_arr": total_arr,
            "revenue_at_risk_annual": revenue_at_risk_annual,
            "risk_distribution": risk_distribution,
            "segment_breakdown": segment_breakdown,
            "contract_breakdown": contract_breakdown,
            "industry_breakdown": industry_breakdown
        }

analytics_service = AnalyticsService()
