import os
import re

directories = ["src/components", "src/pages"]

for directory in directories:
    for filename in os.listdir(directory):
        if not filename.endswith(".tsx"):
            continue
        filepath = os.path.join(directory, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        content = re.sub(r'shadow-\[2px_2px_0px_#000000\]', '', content)
        content = re.sub(r'shadow-neo"\s+shadow-neo', 'shadow-neo-input"', content)
        content = re.sub(r'shadow-neo\s+border-2 border-brand-900', 'border-2 border-brand-900', content)
        # Fix the stray shadow-neo outside quotes
        content = re.sub(r'"\s+shadow-neo\s+/>', '" />', content)
        content = re.sub(r'"\s+shadow-neo\s*>', '">', content)
        
        # Clean up weird double spaces inside classNames without collapsing lines
        # Instead of collapsing lines, we just replace multiple spaces with a single space.
        # But only inside className strings! Too dangerous to do globally.
        # Just clean up specific messes:
        content = re.sub(r'  +', ' ', content)

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
