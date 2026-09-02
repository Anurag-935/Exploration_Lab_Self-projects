import os
import re

directories = ["src/components", "src/pages"]

interaction_classes = " border-2 border-brand-900 shadow-neo active:translate-x-[2px] active:translate-y-[2px] active:shadow-neo-sm font-bold "

def btn_replacer(match):
    cls = match.group(0)
    # Don't add twice
    if 'active:translate' not in cls:
        cls = cls[:-1] + interaction_classes + '"'
    # Ensure they don't have conflicting borders or shadows
    cls = re.sub(r'shadow-(neo|sm|md|lg|xl|2xl)', '', cls)
    cls = re.sub(r'border(?:-2)? border-brand-900(?:/\d+)?', '', cls)
    # Re-insert the classes cleanly
    cls = cls[:-1] + interaction_classes + '"'
    # Clean up double spaces
    cls = re.sub(r'\s+', ' ', cls)
    return cls

for directory in directories:
    for filename in os.listdir(directory):
        if not filename.endswith(".tsx"):
            continue
        filepath = os.path.join(directory, filename)
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()

        content = re.sub(r'<button[^>]*className="[^"]*"', btn_replacer, content)

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
