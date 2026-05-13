import csv
import json
import glob
import os

def convert_all_csvs():
    # Find all .csv files in the current directory and subdirectories
    csv_files = glob.glob('**/*.csv', recursive=True)
    
    for csv_file in csv_files:
        json_file = f"{os.path.splitext(csv_file)[0]}.json"
        print(f"Converting {csv_file} to {json_file}...")
        
        try:
            with open(csv_file, mode='r', encoding='utf-8') as f:
                # DictReader uses the first row as keys for the JSON objects
                reader = csv.DictReader(f)
                data = list(reader)
            
            with open(json_file, mode='w', encoding='utf-8') as f:
                json.dump(data, f, indent=4)
        except Exception as e:
            print(f"Error converting {csv_file}: {e}")

if __name__ == "__main__":
    convert_all_csvs()