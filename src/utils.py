import os
import pandas as pd

def ensure_dir(path: str):
    if not os.path.exists(path):
        os.makedirs(path)

def load_data(path: str):
    return pd.read_csv(path)


