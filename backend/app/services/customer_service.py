import pandas as pd
from app.services.model_service import model_service

class CustomerService:
    def get_customers(
        self,
        search: str = "",
        risk_level: str = "",
        segment: str = "",
        contract_type: str = "",
        sort_by: str = "churn_probability",
        order: str = "desc",
        page: int = 1,
        limit: int = 15
    ) -> dict:
        if not model_service.is_loaded or model_service.processed_df is None:
            raise RuntimeError("Customer dataset is not loaded.")

        df = model_service.processed_df.copy()

        # Filtering
        if search:
            search_clean = search.lower().strip()
            df = df[
                df['account_id'].str.lower().str.contains(search_clean) |
                df['company_name'].str.lower().str.contains(search_clean)
            ]

        if risk_level:
            df = df[df['risk_level'].str.upper() == risk_level.upper()]

        if segment:
            df = df[df['customer_segment'].str.lower() == segment.lower()]

        if contract_type:
            df = df[df['contract_type'].str.lower() == contract_type.lower()]

        # Sorting
        ascending = (order.lower() == "asc")
        if sort_by in df.columns:
            df = df.sort_values(by=sort_by, ascending=ascending)

        total_records = len(df)
        total_pages = max(1, (total_records + limit - 1) // limit)
        page = max(1, min(page, total_pages))

        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paged_df = df.iloc[start_idx:end_idx]

        records = paged_df.to_dict(orient="records")

        return {
            "total_records": total_records,
            "total_pages": total_pages,
            "current_page": page,
            "limit": limit,
            "customers": records
        }

    def get_customer_by_id(self, account_id: str) -> dict:
        if not model_service.is_loaded or model_service.processed_df is None:
            raise RuntimeError("Customer dataset is not loaded.")

        df = model_service.processed_df
        match = df[df['account_id'] == account_id]
        if match.empty:
            raise KeyError(f"Customer with Account ID '{account_id}' not found.")

        return match.iloc[0].to_dict()

customer_service = CustomerService()
