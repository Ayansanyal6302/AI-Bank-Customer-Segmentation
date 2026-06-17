import pandas as pd
import numpy as np

# Set seed for reproducibility
np.random.seed(42)

n_samples = 200

# Generate customer segments
# Segment 1: Low income, low spending (Budget)
n1 = 50
inc1 = np.random.normal(25, 5, n1)
spend1 = np.random.normal(20, 8, n1)

# Segment 2: Low income, high spending (Careless)
n2 = 50
inc2 = np.random.normal(25, 5, n2)
spend2 = np.random.normal(80, 8, n2)

# Segment 3: High income, low spending (Saver)
n3 = 50
inc3 = np.random.normal(85, 12, n3)
spend3 = np.random.normal(20, 8, n3)

# Segment 4: High income, high spending (Premium)
n4 = 50
inc4 = np.random.normal(85, 12, n4)
spend4 = np.random.normal(80, 8, n4)

income = np.concatenate([inc1, inc2, inc3, inc4])
spending = np.concatenate([spend1, spend2, spend3, spend4])

# Clip values to realistic ranges
income = np.clip(income, 10, 140).round(1)
spending = np.clip(spending, 1, 99).astype(int)

age = np.random.randint(18, 70, n_samples)
gender = np.random.choice(['Male', 'Female'], n_samples)
customer_id = np.arange(1, n_samples + 1)

df = pd.DataFrame({
    'CustomerID': customer_id,
    'Gender': gender,
    'Age': age,
    'AnnualIncome': income,
    'SpendingScore': spending
})

df.to_csv('sample_bank_customers.csv', index=False)
print("Successfully generated sample_bank_customers.csv with 200 records!")
