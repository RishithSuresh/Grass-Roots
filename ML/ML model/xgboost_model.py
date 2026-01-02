"""
XGBoost Model Training and Evaluation Script
This script trains an XGBoost model for crop price prediction with hyperparameter tuning
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import xgboost as xgb
import pickle
import warnings
warnings.filterwarnings('ignore')

# Set visualization style
sns.set_style('whitegrid')
plt.rcParams['figure.figsize'] = (12, 8)

def load_processed_data(filepath):
    """Load the preprocessed dataset"""
    print("=" * 60)
    print("LOADING PROCESSED DATA")
    print("=" * 60)
    df = pd.read_csv(filepath)
    print(f"✓ Data loaded successfully!")
    print(f"  Shape: {df.shape}")
    print(f"  Features: {list(df.columns)}")
    return df

def prepare_train_test_split(df, target_col='Price', test_size=0.2, random_state=42):
    """Split data into training and testing sets"""
    print("\n" + "=" * 60)
    print("PREPARING TRAIN-TEST SPLIT")
    print("=" * 60)
    
    # Separate features and target
    X = df.drop(columns=[target_col])
    y = df[target_col]
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )
    
    print(f"✓ Data split completed:")
    print(f"  Training set: {X_train.shape[0]} samples ({(1-test_size)*100:.0f}%)")
    print(f"  Testing set: {X_test.shape[0]} samples ({test_size*100:.0f}%)")
    print(f"  Number of features: {X_train.shape[1]}")
    
    return X_train, X_test, y_train, y_test

def train_baseline_model(X_train, y_train, X_test, y_test):
    """Train a baseline XGBoost model"""
    print("\n" + "=" * 60)
    print("TRAINING BASELINE XGBOOST MODEL")
    print("=" * 60)
    
    # Initialize baseline model
    baseline_model = xgb.XGBRegressor(
        objective='reg:squarederror',
        random_state=42,
        n_estimators=100,
        learning_rate=0.1,
        max_depth=5
    )
    
    # Train model
    print("Training baseline model...")
    baseline_model.fit(X_train, y_train)
    
    # Make predictions
    y_train_pred = baseline_model.predict(X_train)
    y_test_pred = baseline_model.predict(X_test)
    
    # Calculate metrics
    train_rmse = np.sqrt(mean_squared_error(y_train, y_train_pred))
    test_rmse = np.sqrt(mean_squared_error(y_test, y_test_pred))
    train_mae = mean_absolute_error(y_train, y_train_pred)
    test_mae = mean_absolute_error(y_test, y_test_pred)
    train_r2 = r2_score(y_train, y_train_pred)
    test_r2 = r2_score(y_test, y_test_pred)
    
    print("\n✓ Baseline Model Performance:")
    print(f"\n  Training Metrics:")
    print(f"    RMSE: {train_rmse:,.2f}")
    print(f"    MAE:  {train_mae:,.2f}")
    print(f"    R²:   {train_r2:.4f}")
    
    print(f"\n  Testing Metrics:")
    print(f"    RMSE: {test_rmse:,.2f}")
    print(f"    MAE:  {test_mae:,.2f}")
    print(f"    R²:   {test_r2:.4f}")
    
    return baseline_model, test_rmse, test_r2

def hyperparameter_tuning(X_train, y_train):
    """Perform hyperparameter tuning using GridSearchCV"""
    print("\n" + "=" * 60)
    print("HYPERPARAMETER TUNING")
    print("=" * 60)
    
    # Define parameter grid
    param_grid = {
        'n_estimators': [50, 100, 200],
        'learning_rate': [0.01, 0.05, 0.1],
        'max_depth': [3, 5, 7],
        'subsample': [0.8, 1.0],
        'colsample_bytree': [0.8, 1.0],
        'min_child_weight': [1, 3, 5]
    }
    
    print("Parameter grid:")
    for param, values in param_grid.items():
        print(f"  {param}: {values}")
    
    # Initialize XGBoost model
    xgb_model = xgb.XGBRegressor(
        objective='reg:squarederror',
        random_state=42
    )
    
    # Perform grid search with cross-validation
    print("\nPerforming GridSearchCV (this may take a few minutes)...")
    grid_search = GridSearchCV(
        estimator=xgb_model,
        param_grid=param_grid,
        cv=5,
        scoring='neg_mean_squared_error',
        n_jobs=-1,
        verbose=1
    )
    
    grid_search.fit(X_train, y_train)
    
    print("\n✓ Hyperparameter tuning completed!")
    print(f"\n  Best parameters:")
    for param, value in grid_search.best_params_.items():
        print(f"    {param}: {value}")
    
    print(f"\n  Best CV RMSE: {np.sqrt(-grid_search.best_score_):,.2f}")
    
    return grid_search.best_estimator_, grid_search.best_params_

def evaluate_model(model, X_train, y_train, X_test, y_test):
    """Evaluate the trained model"""
    print("\n" + "=" * 60)
    print("MODEL EVALUATION")
    print("=" * 60)
    
    # Make predictions
    y_train_pred = model.predict(X_train)
    y_test_pred = model.predict(X_test)
    
    # Calculate metrics
    train_rmse = np.sqrt(mean_squared_error(y_train, y_train_pred))
    test_rmse = np.sqrt(mean_squared_error(y_test, y_test_pred))
    train_mae = mean_absolute_error(y_train, y_train_pred)
    test_mae = mean_absolute_error(y_test, y_test_pred)
    train_r2 = r2_score(y_train, y_train_pred)
    test_r2 = r2_score(y_test, y_test_pred)
    
    # Calculate MAPE (Mean Absolute Percentage Error)
    train_mape = np.mean(np.abs((y_train - y_train_pred) / y_train)) * 100
    test_mape = np.mean(np.abs((y_test - y_test_pred) / y_test)) * 100
    
    print("\n✓ Final Model Performance:")
    print(f"\n  Training Metrics:")
    print(f"    RMSE:  {train_rmse:,.2f}")
    print(f"    MAE:   {train_mae:,.2f}")
    print(f"    R²:    {train_r2:.4f}")
    print(f"    MAPE:  {train_mape:.2f}%")
    
    print(f"\n  Testing Metrics:")
    print(f"    RMSE:  {test_rmse:,.2f}")
    print(f"    MAE:   {test_mae:,.2f}")
    print(f"    R²:    {test_r2:.4f}")
    print(f"    MAPE:  {test_mape:.2f}%")
    
    # Cross-validation score
    cv_scores = cross_val_score(
        model, X_train, y_train, 
        cv=5, 
        scoring='neg_mean_squared_error'
    )
    cv_rmse = np.sqrt(-cv_scores)
    
    print(f"\n  Cross-Validation (5-fold):")
    print(f"    Mean RMSE: {cv_rmse.mean():,.2f}")
    print(f"    Std RMSE:  {cv_rmse.std():,.2f}")
    
    metrics = {
        'train_rmse': train_rmse,
        'test_rmse': test_rmse,
        'train_mae': train_mae,
        'test_mae': test_mae,
        'train_r2': train_r2,
        'test_r2': test_r2,
        'train_mape': train_mape,
        'test_mape': test_mape,
        'cv_rmse_mean': cv_rmse.mean(),
        'cv_rmse_std': cv_rmse.std()
    }
    
    return metrics, y_test_pred

def plot_feature_importance(model, feature_names):
    """Plot feature importance"""
    print("\n" + "=" * 60)
    print("FEATURE IMPORTANCE ANALYSIS")
    print("=" * 60)
    
    # Get feature importance
    importance = model.feature_importances_
    feature_importance_df = pd.DataFrame({
        'Feature': feature_names,
        'Importance': importance
    }).sort_values('Importance', ascending=False)
    
    print("\nFeature Importance Ranking:")
    for idx, row in feature_importance_df.iterrows():
        print(f"  {row['Feature']}: {row['Importance']:.4f}")
    
    # Plot
    plt.figure(figsize=(10, 6))
    sns.barplot(
        data=feature_importance_df, 
        x='Importance', 
        y='Feature',
        palette='viridis'
    )
    plt.title('XGBoost Feature Importance', fontsize=16, fontweight='bold')
    plt.xlabel('Importance Score', fontsize=12)
    plt.ylabel('Features', fontsize=12)
    plt.tight_layout()
    plt.savefig('/Users/nishanishmitha/Desktop/ML model /feature_importance.png', dpi=300, bbox_inches='tight')
    print("\n✓ Feature importance plot saved as 'feature_importance.png'")
    plt.close()
    
    return feature_importance_df

def plot_predictions(y_test, y_pred):
    """Plot actual vs predicted values"""
    print("\n" + "=" * 60)
    print("GENERATING PREDICTION VISUALIZATIONS")
    print("=" * 60)
    
    # Create figure with subplots
    fig, axes = plt.subplots(1, 2, figsize=(16, 6))
    
    # Plot 1: Actual vs Predicted scatter plot
    axes[0].scatter(y_test, y_pred, alpha=0.6, s=100, edgecolors='black', linewidth=1)
    
    # Add perfect prediction line
    min_val = min(y_test.min(), y_pred.min())
    max_val = max(y_test.max(), y_pred.max())
    axes[0].plot([min_val, max_val], [min_val, max_val], 'r--', linewidth=2, label='Perfect Prediction')
    
    axes[0].set_xlabel('Actual Price', fontsize=12, fontweight='bold')
    axes[0].set_ylabel('Predicted Price', fontsize=12, fontweight='bold')
    axes[0].set_title('Actual vs Predicted Prices', fontsize=14, fontweight='bold')
    axes[0].legend()
    axes[0].grid(True, alpha=0.3)
    
    # Plot 2: Residuals plot
    residuals = y_test - y_pred
    axes[1].scatter(y_pred, residuals, alpha=0.6, s=100, edgecolors='black', linewidth=1, color='coral')
    axes[1].axhline(y=0, color='r', linestyle='--', linewidth=2)
    axes[1].set_xlabel('Predicted Price', fontsize=12, fontweight='bold')
    axes[1].set_ylabel('Residuals', fontsize=12, fontweight='bold')
    axes[1].set_title('Residual Plot', fontsize=14, fontweight='bold')
    axes[1].grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig('/Users/nishanishmitha/Desktop/ML model /prediction_analysis.png', dpi=300, bbox_inches='tight')
    print("✓ Prediction analysis plot saved as 'prediction_analysis.png'")
    plt.close()

def save_model(model, filepath):
    """Save the trained model"""
    with open(filepath, 'wb') as f:
        pickle.dump(model, f)
    print(f"\n✓ Model saved to: {filepath}")

def main():
    """Main execution function"""
    print("\n" + "=" * 60)
    print("CROP PRICE PREDICTION - XGBOOST MODEL TRAINING")
    print("=" * 60)
    
    # File paths
    data_file = '/Users/nishanishmitha/Desktop/ML model /processed_data.csv'
    model_file = '/Users/nishanishmitha/Desktop/ML model /xgboost_model.pkl'
    
    # 1. Load processed data
    df = load_processed_data(data_file)
    
    # 2. Prepare train-test split
    X_train, X_test, y_train, y_test = prepare_train_test_split(df)
    
    # 3. Train baseline model
    baseline_model, baseline_rmse, baseline_r2 = train_baseline_model(
        X_train, y_train, X_test, y_test
    )
    
    # 4. Hyperparameter tuning
    best_model, best_params = hyperparameter_tuning(X_train, y_train)
    
    # 5. Evaluate final model
    metrics, y_pred = evaluate_model(best_model, X_train, y_train, X_test, y_test)
    
    # 6. Feature importance analysis
    feature_importance = plot_feature_importance(best_model, X_train.columns.tolist())
    
    # 7. Prediction visualizations
    plot_predictions(y_test, y_pred)
    
    # 8. Save model
    save_model(best_model, model_file)
    
    # Final summary
    print("\n" + "=" * 60)
    print("MODEL TRAINING COMPLETE!")
    print("=" * 60)
    
    print("\n📊 Performance Summary:")
    print(f"  Test R² Score: {metrics['test_r2']:.4f}")
    print(f"  Test RMSE: ₹{metrics['test_rmse']:,.2f}")
    print(f"  Test MAE: ₹{metrics['test_mae']:,.2f}")
    print(f"  Test MAPE: {metrics['test_mape']:.2f}%")
    
    improvement = ((baseline_rmse - metrics['test_rmse']) / baseline_rmse) * 100
    print(f"\n  Improvement over baseline: {improvement:.2f}%")
    
    print("\n📁 Generated Files:")
    print("  ✓ xgboost_model.pkl")
    print("  ✓ feature_importance.png")
    print("  ✓ prediction_analysis.png")
    
    print("\n🎯 Top 3 Most Important Features:")
    for idx, row in feature_importance.head(3).iterrows():
        print(f"  {idx+1}. {row['Feature']}: {row['Importance']:.4f}")

if __name__ == "__main__":
    main()
