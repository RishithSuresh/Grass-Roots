"""
Data Preprocessing and Feature Engineering Script
This script cleans the data and performs feature engineering for crop price prediction
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import LabelEncoder
import warnings
warnings.filterwarnings('ignore')

# Set visualization style
sns.set_style('whitegrid')
plt.rcParams['figure.figsize'] = (12, 8)

def load_data(filepath):
    """Load the dataset"""
    print("=" * 60)
    print("LOADING DATA")
    print("=" * 60)
    df = pd.read_csv(filepath)
    print(f"Dataset loaded successfully!")
    print(f"Shape: {df.shape}")
    print(f"\nColumns: {list(df.columns)}")
    return df

def exploratory_analysis(df):
    """Perform exploratory data analysis"""
    print("\n" + "=" * 60)
    print("EXPLORATORY DATA ANALYSIS")
    print("=" * 60)
    
    # Basic info
    print("\nDataset Info:")
    print(df.info())
    
    print("\nBasic Statistics:")
    print(df.describe())
    
    print("\nMissing Values:")
    print(df.isnull().sum())
    
    print("\nDuplicate Rows:", df.duplicated().sum())
    
    # Categorical features analysis
    print("\n" + "-" * 60)
    print("CATEGORICAL FEATURES ANALYSIS")
    print("-" * 60)
    print(f"\nUnique States: {df['State'].nunique()}")
    print(df['State'].value_counts())
    print(f"\nUnique Crops: {df['Crop'].nunique()}")
    print(df['Crop'].value_counts())
    
    # Correlation analysis
    print("\n" + "-" * 60)
    print("CORRELATION ANALYSIS")
    print("-" * 60)
    
    # Select only numeric columns
    numeric_df = df.select_dtypes(include=[np.number])
    
    # Correlation with target (Price)
    correlations = numeric_df.corr()['Price'].sort_values(ascending=False)
    print("\nCorrelation with Price:")
    print(correlations)
    
    # Check multicollinearity between CostCultivation features
    cost_corr = df[['CostCultivation', 'CostCultivation2']].corr()
    print(f"\nCorrelation between CostCultivation and CostCultivation2:")
    print(cost_corr)
    
    # Visualize correlations
    plt.figure(figsize=(10, 8))
    sns.heatmap(numeric_df.corr(), annot=True, cmap='coolwarm', center=0, 
                fmt='.2f', square=True, linewidths=1)
    plt.title('Feature Correlation Matrix', fontsize=16, fontweight='bold')
    plt.tight_layout()
    plt.savefig('/Users/nishanishmitha/Desktop/ML model /correlation_matrix.png', dpi=300, bbox_inches='tight')
    print("\n✓ Correlation matrix saved as 'correlation_matrix.png'")
    plt.close()
    
    return correlations

def detect_outliers(df, columns):
    """Detect outliers using IQR method"""
    print("\n" + "=" * 60)
    print("OUTLIER DETECTION")
    print("=" * 60)
    
    outlier_info = {}
    
    for col in columns:
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        
        outliers = df[(df[col] < lower_bound) | (df[col] > upper_bound)]
        outlier_count = len(outliers)
        
        outlier_info[col] = {
            'count': outlier_count,
            'percentage': (outlier_count / len(df)) * 100,
            'lower_bound': lower_bound,
            'upper_bound': upper_bound
        }
        
        if outlier_count > 0:
            print(f"\n{col}:")
            print(f"  Outliers detected: {outlier_count} ({outlier_info[col]['percentage']:.2f}%)")
            print(f"  Valid range: [{lower_bound:.2f}, {upper_bound:.2f}]")
    
    return outlier_info

def feature_engineering(df):
    """Perform feature engineering"""
    print("\n" + "=" * 60)
    print("FEATURE ENGINEERING")
    print("=" * 60)
    
    df_engineered = df.copy()
    
    # 1. Encode categorical variables
    print("\n1. Encoding categorical variables...")
    le_state = LabelEncoder()
    le_crop = LabelEncoder()
    
    df_engineered['State_Encoded'] = le_state.fit_transform(df_engineered['State'])
    df_engineered['Crop_Encoded'] = le_crop.fit_transform(df_engineered['Crop'])
    
    print(f"   ✓ State encoded: {df['State'].nunique()} unique values")
    print(f"   ✓ Crop encoded: {df['Crop'].nunique()} unique values")
    
    # 2. Create derived features
    print("\n2. Creating derived features...")
    
    # Cost efficiency: Production per unit cost
    df_engineered['Cost_Efficiency'] = df_engineered['Production'] / (df_engineered['CostCultivation'] + 1)
    
    # Yield to Rainfall ratio
    df_engineered['Yield_Rainfall_Ratio'] = df_engineered['Yield'] / (df_engineered['RainFall Annual'] + 1)
    
    # Temperature-Rainfall interaction
    df_engineered['Temp_Rain_Interaction'] = df_engineered['Temperature'] * df_engineered['RainFall Annual']
    
    # Total cultivation cost (average of both cost columns)
    df_engineered['Total_Cost_Avg'] = (df_engineered['CostCultivation'] + df_engineered['CostCultivation2']) / 2
    
    print("   ✓ Cost_Efficiency created")
    print("   ✓ Yield_Rainfall_Ratio created")
    print("   ✓ Temp_Rain_Interaction created")
    print("   ✓ Total_Cost_Avg created")
    
    # 3. Feature selection - Remove redundant features
    print("\n3. Feature selection...")
    
    # Check correlation between CostCultivation and CostCultivation2
    cost_corr = df_engineered[['CostCultivation', 'CostCultivation2']].corr().iloc[0, 1]
    print(f"   Correlation between cost features: {cost_corr:.4f}")
    
    # Remove original categorical columns and one of the highly correlated cost columns
    features_to_remove = ['State', 'Crop', 'CostCultivation2']
    df_engineered = df_engineered.drop(columns=features_to_remove)
    
    print(f"   ✓ Removed features: {features_to_remove}")
    print(f"   ✓ Remaining features: {list(df_engineered.columns)}")
    
    return df_engineered, le_state, le_crop

def visualize_feature_distributions(df):
    """Visualize feature distributions"""
    print("\n" + "=" * 60)
    print("GENERATING VISUALIZATIONS")
    print("=" * 60)
    
    # Select numeric columns only
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    
    # Remove encoded columns for cleaner visualization
    viz_cols = [col for col in numeric_cols if 'Encoded' not in col and col != 'Price']
    
    # Distribution plots
    n_cols = 3
    n_rows = (len(viz_cols) + n_cols - 1) // n_cols
    
    fig, axes = plt.subplots(n_rows, n_cols, figsize=(15, n_rows * 4))
    axes = axes.flatten() if n_rows > 1 else [axes] if n_cols == 1 else axes
    
    for idx, col in enumerate(viz_cols):
        if idx < len(axes):
            axes[idx].hist(df[col], bins=20, color='skyblue', edgecolor='black', alpha=0.7)
            axes[idx].set_title(f'Distribution of {col}', fontweight='bold')
            axes[idx].set_xlabel(col)
            axes[idx].set_ylabel('Frequency')
            axes[idx].grid(True, alpha=0.3)
    
    # Hide unused subplots
    for idx in range(len(viz_cols), len(axes)):
        axes[idx].axis('off')
    
    plt.tight_layout()
    plt.savefig('/Users/nishanishmitha/Desktop/ML model /feature_distributions.png', dpi=300, bbox_inches='tight')
    print("✓ Feature distributions saved as 'feature_distributions.png'")
    plt.close()

def save_processed_data(df, filepath):
    """Save the processed dataset"""
    df.to_csv(filepath, index=False)
    print(f"\n✓ Processed data saved to: {filepath}")
    print(f"  Final shape: {df.shape}")
    print(f"  Features: {list(df.columns)}")

def main():
    """Main execution function"""
    print("\n" + "=" * 60)
    print("CROP PRICE PREDICTION - DATA PREPROCESSING")
    print("=" * 60)
    
    # File paths
    input_file = '/Users/nishanishmitha/Desktop/ML model /dataset.csv'
    output_file = '/Users/nishanishmitha/Desktop/ML model /processed_data.csv'
    
    # 1. Load data
    df = load_data(input_file)
    
    # 2. Exploratory analysis
    correlations = exploratory_analysis(df)
    
    # 3. Detect outliers
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    outlier_info = detect_outliers(df, numeric_cols)
    
    # 4. Feature engineering
    df_processed, le_state, le_crop = feature_engineering(df)
    
    # 5. Visualize distributions
    visualize_feature_distributions(df_processed)
    
    # 6. Save processed data
    save_processed_data(df_processed, output_file)
    
    print("\n" + "=" * 60)
    print("PREPROCESSING COMPLETE!")
    print("=" * 60)
    print("\nKey Insights:")
    print(f"  • Dataset size: {df_processed.shape[0]} samples")
    print(f"  • Number of features: {df_processed.shape[1] - 1} (excluding target)")
    print(f"  • Target variable: Price")
    print(f"  • Top 3 correlated features with Price:")
    corr_items = list(correlations.head(4).items())
    for i, (feature, corr) in enumerate(corr_items[1:4], 1):
        print(f"    {i}. {feature}: {corr:.4f}")
    
    print("\nGenerated Files:")
    print("  ✓ processed_data.csv")
    print("  ✓ correlation_matrix.png")
    print("  ✓ feature_distributions.png")

if __name__ == "__main__":
    main()
