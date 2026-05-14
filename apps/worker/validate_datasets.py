import kagglehub
import sys

def validate():
    datasets = [
        "olistbr/brazilian-ecommerce",
        "tunguz/online-retail",
        "ankitverma2010/ecommerce-customer-churn-analysis-and-prediction"
    ]
    
    print("🔍 Validating Kaggle Datasets...")
    all_ok = True
    
    for dataset in datasets:
        print(f"Checking {dataset}...", end=" ", flush=True)
        try:
            # metadata check
            path = kagglehub.dataset_download(dataset)
            print(f"✅ OK (Downloaded to: {path})")
        except Exception as e:
            print(f"❌ ERROR: {e}")
            all_ok = False
            
    if all_ok:
        print("\n✨ All datasets are accessible!")
    else:
        print("\n⚠️ Some datasets failed to load. Please check your Kaggle credentials or dataset availability.")
        sys.exit(1)

if __name__ == "__main__":
    validate()
