import os
import numpy as np
import pandas as pd

def generate_enterprise_churn_dataset(num_samples=1500, random_seed=42):
    np.random.seed(random_seed)

    industries = ['Enterprise Tech', 'Financial Services', 'Healthcare', 'E-Commerce', 'Logistics', 'Manufacturing', 'Professional Services']
    segments = ['Enterprise', 'Mid-Market', 'SMB']
    contract_types = ['Month-to-Month', '1-Year Fixed', '2-Year Fixed', '3-Year Enterprise']
    payment_methods = ['Auto-Invoice', 'Credit Card', 'ACH Direct Debit', 'Manual Wire']
    
    company_prefixes = ['Apex', 'Vortex', 'Nexus', 'Starlight', 'Omni', 'Hyperion', 'Synergy', 'Quantum', 'Acme', 'Titan', 'Aegis', 'Crest', 'Zenith', 'Solstice', 'Velocity']
    company_suffixes = ['Systems', 'Solutions', 'Global', 'Corp', 'Labs', 'Technologies', 'Networks', 'Capital', 'Health', 'Logistics', 'Cloud', 'Data']

    company_names = [
        f"{np.random.choice(company_prefixes)} {np.random.choice(company_suffixes)}"
        for _ in range(num_samples)
    ]
    
    account_ids = [f"AC-{1000 + i}" for i in range(1, num_samples + 1)]
    industry_col = np.random.choice(industries, size=num_samples, p=[0.25, 0.20, 0.15, 0.15, 0.10, 0.08, 0.07])
    segment_col = np.random.choice(segments, size=num_samples, p=[0.30, 0.45, 0.25])
    contract_col = np.random.choice(contract_types, size=num_samples, p=[0.35, 0.35, 0.20, 0.10])
    payment_col = np.random.choice(payment_methods, size=num_samples, p=[0.40, 0.30, 0.20, 0.10])
    
    tenure_months = np.random.randint(1, 73, size=num_samples)
    
    # Monthly charges depend somewhat on segment
    base_charges = np.where(segment_col == 'Enterprise', np.random.uniform(1500, 4800, size=num_samples),
                    np.where(segment_col == 'Mid-Market', np.random.uniform(600, 2000, size=num_samples),
                            np.random.uniform(200, 800, size=num_samples)))
    monthly_charges = np.round(base_charges, 2)
    
    total_charges = np.round(tenure_months * monthly_charges * np.random.uniform(0.95, 1.05, size=num_samples), 2)
    
    contract_licenses = np.where(segment_col == 'Enterprise', np.random.randint(50, 500, size=num_samples),
                         np.where(segment_col == 'Mid-Market', np.random.randint(15, 80, size=num_samples),
                                 np.random.randint(5, 25, size=num_samples)))
    
    # Active user ratio
    license_util_ratio = np.random.uniform(0.3, 1.0, size=num_samples)
    active_users = np.clip(np.round(contract_licenses * license_util_ratio), 1, contract_licenses).astype(int)
    
    support_tickets_30d = np.random.poisson(lam=3.5, size=num_samples)
    sla_breaches_90d = np.random.poisson(lam=0.8, size=num_samples)
    
    nps_score = np.clip(np.round(np.random.normal(loc=7.2, scale=2.1, size=num_samples)), 1, 10).astype(int)
    last_login_days_ago = np.random.geometric(p=0.15, size=num_samples) - 1
    last_login_days_ago = np.clip(last_login_days_ago, 0, 60)
    
    feature_usage_score = np.clip(np.round(np.random.normal(loc=68.0, scale=18.0, size=num_samples), 1), 5.0, 100.0)
    executive_sponsor_present = np.random.choice([0, 1], size=num_samples, p=[0.35, 0.65])
    discount_percentage = np.random.choice([0, 5, 10, 15, 20, 25], size=num_samples, p=[0.3, 0.25, 0.2, 0.15, 0.07, 0.03])
    paperless_billing = np.random.choice([0, 1], size=num_samples, p=[0.2, 0.8])
    auto_renewal = np.random.choice([0, 1], size=num_samples, p=[0.4, 0.6])

    # Calculate log-odds of churn based on realistic business domain rules
    log_odds = (
        -1.2
        + 0.9 * (contract_col == 'Month-to-Month')
        - 0.8 * (contract_col == '3-Year Enterprise')
        - 0.5 * (contract_col == '2-Year Fixed')
        + 0.04 * (support_tickets_30d - 3)
        + 0.35 * sla_breaches_90d
        - 0.25 * (nps_score - 7)
        + 0.04 * (last_login_days_ago - 7)
        - 0.03 * (feature_usage_score - 65)
        - 0.03 * (tenure_months - 24)
        + 0.0003 * (monthly_charges - 1200)
        - 0.7 * executive_sponsor_present
        - 0.5 * auto_renewal
        + 0.6 * (license_util_ratio < 0.5)
    )

    prob = 1 / (1 + np.exp(-log_odds))
    churn = (np.random.uniform(0, 1, size=num_samples) < prob).astype(int)

    df = pd.DataFrame({
        'account_id': account_ids,
        'company_name': company_names,
        'industry': industry_col,
        'customer_segment': segment_col,
        'contract_type': contract_col,
        'payment_method': payment_col,
        'tenure_months': tenure_months,
        'monthly_charges': monthly_charges,
        'total_charges': total_charges,
        'contract_licenses': contract_licenses,
        'active_users': active_users,
        'support_tickets_30d': support_tickets_30d,
        'sla_breaches_90d': sla_breaches_90d,
        'nps_score': nps_score,
        'last_login_days_ago': last_login_days_ago,
        'feature_usage_score': feature_usage_score,
        'executive_sponsor_present': executive_sponsor_present,
        'discount_percentage': discount_percentage,
        'paperless_billing': paperless_billing,
        'auto_renewal': auto_renewal,
        'churn': churn
    })

    out_dir = os.path.join(os.path.dirname(__file__), '../data')
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, 'enterprise_churn.csv')
    df.to_csv(out_path, index=False)
    print(f"Generated dataset with shape {df.shape} saved to {out_path}. Churn rate: {df['churn'].mean():.2%}")
    return df

if __name__ == '__main__':
    generate_enterprise_churn_dataset()
