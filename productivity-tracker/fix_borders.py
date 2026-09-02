import os
import re

directories = ["src/components", "src/pages"]

for directory in directories:
    for filename in os.listdir(directory):
        if not filename.endswith(".tsx"):
            continue
        filepath = os.path.join(directory, filename)
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()

        # 1. Replace soft borders with thick hard borders
        content = re.sub(r'border border-brand-900(?:/\d+)?', 'border-2 border-brand-900', content)
        content = re.sub(r'border-b border-brand-900(?:/\d+)?', 'border-b-2 border-brand-900', content)
        content = re.sub(r'border-t border-brand-900(?:/\d+)?', 'border-t-2 border-brand-900', content)
        
        # 2. Replace all soft shadows with hard shadow
        content = re.sub(r'shadow-(lg|xl|2xl|md|sm)', 'shadow-neo', content)

        # 3. Add shadow-neo to bg-brand-dark containers if they don't have it
        def card_replacer(match):
            cls = match.group(0)
            if 'shadow-' not in cls:
                cls = cls[:-1] + ' shadow-neo"'
            return cls
        content = re.sub(r'className="[^"]*bg-brand-dark[^"]*"', card_replacer, content)

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
