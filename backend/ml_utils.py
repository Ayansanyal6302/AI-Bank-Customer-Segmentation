import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import json
import os

# Fix for KMeans memory leak on Windows
os.environ["OMP_NUM_THREADS"] = "1"

def preprocess_data(df: pd.DataFrame):
    """
    Cleans and scales the dataset.
    Returns the scaled dataframe and the list of selected features.
    """
    # Drop rows with mostly NaNs or handle missing values
    # For simplicity, let's fill numeric columns with their median and categorical with mode
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    
    # Fill missing values
    for col in numeric_cols:
        df[col] = df[col].fillna(df[col].median())
        
    # We will only cluster on numerical columns
    features_to_cluster = numeric_cols
    
    # Ensure there are at least some numerical columns
    if not features_to_cluster:
        raise ValueError("No numerical columns found for clustering.")
        
    X = df[features_to_cluster]
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Return a dataframe of the scaled features for easier manipulation later
    df_scaled = pd.DataFrame(X_scaled, columns=features_to_cluster)
    
    return df, df_scaled, features_to_cluster

def calculate_elbow(df_scaled: pd.DataFrame, max_k: int = 10):
    """
    Calculates the Within-Cluster-Sum-of-Squares (WCSS) for different values of k.
    """
    wcss = []
    # Ensure max_k doesn't exceed number of samples
    max_k = min(max_k, len(df_scaled) - 1)
    if max_k < 2:
        return [{"k": 1, "wcss": 0}]

    for i in range(1, max_k + 1):
        kmeans = KMeans(n_clusters=i, init='k-means++', max_iter=300, n_init=10, random_state=42)
        kmeans.fit(df_scaled)
        wcss.append({"k": i, "wcss": kmeans.inertia_})
    
    return wcss

def perform_clustering(df: pd.DataFrame, df_scaled: pd.DataFrame, features: list, k: int):
    """
    Performs K-Means clustering and returns the dataframe with cluster labels and cluster stats.
    """
    kmeans = KMeans(n_clusters=k, init='k-means++', max_iter=300, n_init=10, random_state=42)
    
    if features:
        X = df_scaled[features]
    else:
        X = df_scaled
        
    cluster_labels = kmeans.fit_predict(X)
    
    # Add labels to original dataframe
    df['Cluster'] = cluster_labels
    
    # Generate Cluster Stats (Insights)
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if 'Cluster' in numeric_cols:
        numeric_cols.remove('Cluster')
        
    cluster_stats = []
    for cluster_id in range(k):
        cluster_data = df[df['Cluster'] == cluster_id]
        
        stats = {
            "cluster": cluster_id,
            "count": len(cluster_data),
            "percentage": round(len(cluster_data) / len(df) * 100, 2),
            "averages": {}
        }
        
        for col in numeric_cols:
            stats["averages"][col] = round(cluster_data[col].mean(), 2)
            
        cluster_stats.append(stats)
        
    # Generate business recommendations / names based on basic heuristics if standard columns exist
    # E.g., if 'Income' and 'Spending' are present
    income_cols = [c for c in df.columns if 'income' in c.lower() or 'salary' in c.lower() or 'balance' in c.lower()]
    spend_cols = [c for c in df.columns if 'spend' in c.lower() or 'score' in c.lower() or 'transaction' in c.lower()]
    
    for stats in cluster_stats:
        name = f"Segment {stats['cluster']}"
        desc = "Standard customer segment."
        
        if income_cols and spend_cols:
            inc_col = income_cols[0]
            spd_col = spend_cols[0]
            
            # Simple heuristic
            inc_avg = stats["averages"].get(inc_col, 0)
            spd_avg = stats["averages"].get(spd_col, 0)
            
            # Find overall averages
            overall_inc = df[inc_col].mean()
            overall_spd = df[spd_col].mean()
            
            if inc_avg > overall_inc and spd_avg > overall_spd:
                name = "Premium Customers"
                desc = "High income, high spending. Highly valuable segment."
            elif inc_avg > overall_inc and spd_avg < overall_spd:
                name = "Saver Customers"
                desc = "High income, low spending. Target for upselling."
            elif inc_avg < overall_inc and spd_avg > overall_spd:
                name = "Careless Spenders"
                desc = "Low income, high spending. Target with credit products cautiously."
            else:
                name = "Budget Customers"
                desc = "Low income, low spending. Offer budget-friendly services."
                
        stats["name"] = name
        stats["description"] = desc

    return df, cluster_stats
