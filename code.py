import sys
import os

# Add project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.utils import load_data, ensure_dir
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

