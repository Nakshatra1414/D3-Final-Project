import sys, os
# Add the project root to PYTHONPATH
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(ROOT_DIR)

from utils import load_data, ensure_dir

import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import os

from utils import load_data, ensure_dir


DATA_PATH = "data/online_shoppers_intention.csv"
OUTPUT_DIR = "data/processed"
ensure_dir(OUTPUT_DIR)

df = load_data(DATA_PATH)

# Summary
print("\n=== DATA INFO ===")
print(df.info())

print("\n=== MISSING VALUES ===")
print(df.isnull().sum())

print("\n=== DESCRIPTIVE STATS ===")
print(df.describe(include="all"))

# Correlation heatmap
plt.figure(figsize=(12,8))
sns.heatmap(df.corr(numeric_only=True), annot=False)
plt.title("Correlation Heatmap")
plt.savefig(f"{OUTPUT_DIR}/correlation_heatmap.png")
plt.close()

# Target Balance
plt.figure()
sns.countplot(x=df["Revenue"])
plt.title("Target Balance")
plt.savefig(f"{OUTPUT_DIR}/target_balance.png")
plt.close()

print("\nEDA Completed. Outputs saved in data/processed/")
