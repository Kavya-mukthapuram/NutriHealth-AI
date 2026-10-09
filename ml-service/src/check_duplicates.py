import pandas as pd

df = pd.read_csv("data/processed/nutrition_ml_dataset.csv")

print("=" * 80)
print("DUPLICATE RECORD ANALYSIS")
print("=" * 80)

print(f"\nTotal rows: {len(df)}")

# Check complete duplicate rows
duplicate_rows = df.duplicated().sum()

print(f"Complete duplicate rows: {duplicate_rows}")

# Check duplicate participant IDs
duplicate_seqn = df["SEQN"].duplicated().sum()

print(f"Duplicate SEQN values: {duplicate_seqn}")

# Show duplicated SEQN values if any
if duplicate_seqn > 0:
    print("\nDuplicated SEQN values:")
    print(df.loc[df["SEQN"].duplicated(keep=False), "SEQN"].sort_values().to_list())

print("\n" + "=" * 80)
print("CONCLUSION")
print("=" * 80)

if duplicate_rows == 0 and duplicate_seqn == 0:
    print("No duplicate records found.")
else:
    print("Duplicate records were found and require investigation.")