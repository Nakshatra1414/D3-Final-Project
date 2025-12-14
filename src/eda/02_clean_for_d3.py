import os
import pandas as pd
import sys, os
# Add src folder to Python path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(ROOT_DIR)

from utils import load_data, ensure_dir


# Paths
DATA_PATH = "data/online_shoppers_intention.csv"
OUTPUT_DIR = "data/processed"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "online_shoppers_d3.csv")

# Ensure output directory exists
ensure_dir(OUTPUT_DIR)

# Load dataset
df = load_data(DATA_PATH)

# Select only columns needed for D3 visualization
columns_to_keep = [
    "Month",
    "VisitorType",
    "Weekend",
    "Revenue",
    "BounceRates",
    "ExitRates",
    "ProductRelated",
    "PageValues",
    "TrafficType"
]

df_d3 = df[columns_to_keep].copy()

# Convert boolean columns to string for D3
df_d3["Weekend"] = df_d3["Weekend"].astype(str)
df_d3["Revenue"] = df_d3["Revenue"].astype(str)

# Save CSV for D3
df_d3.to_csv(OUTPUT_FILE, index=False)
print(f"✅ D3-ready CSV saved at: {OUTPUT_FILE}")
