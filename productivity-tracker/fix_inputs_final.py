import os
import re

directories = ["src/components", "src/pages"]

interaction_classes = " border-2 border-brand-900 shadow-neo-input "

def input_replacer(match):
    prefix = match.group(1)
    cls = match.group(2)
    suffix = match.group(3)
    if 'shadow-neo' not in cls:
        cls += interaction_classes
    return prefix + cls + suffix

for directory in directories:
    for filename in os.listdir(directory):
        if not filename.endswith(".tsx"):
            continue
        filepath = os.path.join(directory, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        content = re.sub(r'(<input[\s\S]*?className=")([^"]*)(")', input_replacer, content)
        content = re.sub(r'(<textarea[\s\S]*?className=")([^"]*)(")', input_replacer, content)
        content = re.sub(r'(<select[\s\S]*?className=")([^"]*)(")', input_replacer, content)

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
