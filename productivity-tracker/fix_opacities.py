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

        # Clean up any remaining /50 /30 opacities on borders to solid black
        content = re.sub(r'border-brand-900/\d+', 'border-brand-900', content)
        
        # In Neobrutalism, text usually isn't very faint either, but brand-light/70 on #FAF3E0 would be grey text, which is fine for muted.
        # But wait, brand-light is #1A1A1A, so brand-light/50 is transparent black. That's actually correct for a muted effect!
        # brand-darker/50 on a white card would be transparent cream, maybe weird, but let's see.

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
