import os
import re

directories = ["src/components", "src/pages"]

interaction_classes = " border-2 border-brand-900 shadow-[2px_2px_0px_#000000] "

def input_replacer(match):
    cls = match.group(0)
    if 'shadow-[' not in cls:
        cls = cls[:-1] + interaction_classes + '"'
    cls = re.sub(r'border(?:-2)? border-brand-900(?:/\d+)?', '', cls)
    cls = cls[:-1] + interaction_classes + '"'
    cls = re.sub(r'\s+', ' ', cls)
    return cls

for directory in directories:
    for filename in os.listdir(directory):
        if not filename.endswith(".tsx"):
            continue
        filepath = os.path.join(directory, filename)
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()

        content = re.sub(r'<input[^>]*className="[^"]*"', input_replacer, content)
        content = re.sub(r'<textarea[^>]*className="[^"]*"', input_replacer, content)
        content = re.sub(r'<select[^>]*className="[^"]*"', input_replacer, content)

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
