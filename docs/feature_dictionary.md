# Feature Dictionary & Data Schema

This document details all raw and engineered features utilized by the Explainable Customer Churn Prediction Engine.

## Raw Dataset Attributes

| Feature Name | Data Type | Type | Range / Categories | Description |
| :--- | :--- | :--- | :--- | :--- |
| `account_id` | String | Identifier | `AC-1001` to `AC-9999` | Unique enterprise account code |
| `company_name` | String | Text | E.g. Apex Global | Enterprise client account name |
| `industry` | Categorical | Categorical | Enterprise Tech, Financial Services, Healthcare, E-Commerce, Logistics, Manufacturing, Professional Services | Primary industry vertical |
| `customer_segment` | Categorical | Categorical | Enterprise, Mid-Market, SMB | Account sizing segment |
| `contract_type` | Categorical | Categorical | Month-to-Month, 1-Year Fixed, 2-Year Fixed, 3-Year Enterprise | Contract agreement duration |
| `payment_method` | Categorical | Categorical | Auto-Invoice, Credit Card, ACH Direct Debit, Manual Wire | Billing payment method |
| `tenure_months` | Integer | Numerical | 1 – 72 months | Account tenure length |
| `monthly_charges` | Float | Numerical | $150.00 – $5,000.00 | Monthly recurring bill amount ($) |
| `total_charges` | Float | Numerical | Continuous ($) | Lifetime total revenue billed |
| `contract_licenses` | Integer | Numerical | 5 – 500 | Purchased product seats/licenses |
| `active_users` | Integer | Numerical | 1 – 500 | Monthly active seats utilized |
| `support_tickets_30d` | Integer | Numerical | 0 – 25 | Customer support tickets opened in past 30 days |
| `sla_breaches_90d` | Integer | Numerical | 0 – 10 | Technical SLA breaches recorded in past 90 days |
| `nps_score` | Integer | Numerical | 1 – 10 | Net Promoter Score survey result |
| `last_login_days_ago` | Integer | Numerical | 0 – 60 days | Inactivity duration since last admin login |
| `feature_usage_score` | Float | Numerical | 0.0 – 100.0 | Composite feature adoption index |
| `executive_sponsor_present` | Binary | Indicator | 0 or 1 | Dedicated executive sponsor presence |
| `discount_percentage` | Integer | Numerical | 0% – 35% | Applied account discount percentage |
| `paperless_billing` | Binary | Indicator | 0 or 1 | Paperless invoice setting |
| `auto_renewal` | Binary | Indicator | 0 or 1 | Automatic contract renewal enabled |
| `churn` | Binary | Target | 0 (Retain) or 1 (Churn) | Binary target variable |

---

## Engineered Features

| Engineered Feature | Base Formula / Calculation | Rationale & Domain Business Logic |
| :--- | :--- | :--- |
| `support_ticket_rate` | $\frac{\text{support\_tickets\_30d}}{\text{tenure\_months} + 1}$ | Measures ticket frequency normalized by account tenure length. |
| `usage_per_license` | $\min\left(1.5, \frac{\text{active\_users}}{\text{contract\_licenses} + 1e-5}\right)$ | Seat utilization ratio. Values < 0.5 indicate shelfware risk. |
| `charge_per_user` | $\frac{\text{monthly\_charges}}{\text{active\_users} + 1e-5}$ | Cost per active user seat, highlighting expensive underutilized accounts. |
| `engagement_score` | $(0.6 \times \text{feature\_usage}) + (0.4 \times \text{nps\_score} \times 10)$ | Weighted index combining product usage depth and satisfaction. |
| `account_health_index` | $(8 \times \text{nps}) - (1.5 \times \text{inactivity}) - (10 \times \text{sla\_breaches}) + (15 \times \text{sponsor}) + (20 \times \text{seat\_utilization})$ | Multi-dimensional health score ranging from -100 to 100+. |
