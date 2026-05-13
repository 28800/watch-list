import re
import glob
import os

def extract_links():
    # Regex to find http/https URLs
    url_pattern = re.compile(r'https?://[^\s,"\'<>]+')
    found_links = set() # Use a set to avoid duplicate links

    # Find all CSV files recursively
    csv_files = glob.glob('**/*.csv', recursive=True)

    for csv_file in csv_files:
        print(f"Scanning {csv_file}...")
        try:
            with open(csv_file, mode='r', encoding='utf-8') as f:
                content = f.read()
                links = url_pattern.findall(content)
                found_links.update(links)
        except Exception as e:
            print(f"Could not read {csv_file}: {e}")

    # Write found links to links.md
    with open('links.md', 'w', encoding='utf-8') as md_file:
        for link in sorted(found_links):
            md_file.write(f"{link}\n")
    
    print(f"Done! Extracted {len(found_links)} unique links to links.md")

if __name__ == "__main__":
    extract_links()