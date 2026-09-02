import os
import re

directories = ["src/components", "src/pages"]

interaction_classes = " border-2 border-brand-900 shadow-neo active:translate-x-[2px] active:translate-y-[2px] active:shadow-neo-sm font-bold "

def btn_replacer(match):
    cls = match.group(0)
    if 'active:translate' not in cls:
        cls = cls[:-1] + interaction_classes + '"'
    return cls

for directory in directories:
    for filename in os.listdir(directory):
        if not filename.endswith(".tsx"):
            continue
        filepath = os.path.join(directory, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        content = re.sub(r'<button[^>]*className="[^"]*"', btn_replacer, content)

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
