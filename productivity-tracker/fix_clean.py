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

        # Clean up messed up inputs
        content = re.sub(r'shadow-neo"\s+shadow-neo\s+/>', 'shadow-neo-input" />', content)
        content = re.sub(r'shadow-neo"\s+shadow-neo\s*>', 'shadow-neo-input">', content)
        content = re.sub(r'shadow-\[2px_2px_0px_#000000\]"\s+border-2 border-brand-900 shadow-\[2px_2px_0px_#000000\]\s*>', 'border-2 border-brand-900 shadow-neo-input">', content)

        # Clean up double shadow-neo inside className
        content = re.sub(r'shadow-neo shadow-neo', 'shadow-neo', content)
        
        # Clean up messed up buttons
        content = re.sub(r'active:translate-x-\[2px\] active:translate-y-\[2px\] active:-sm font-bold border-2 border-brand-900 shadow-neo active:translate-x-\[2px\] active:translate-y-\[2px\] active:shadow-neo-sm font-bold', 'border-2 border-brand-900 shadow-neo active:translate-x-[2px] active:translate-y-[2px] active:shadow-neo-sm font-bold', content)
        content = re.sub(r'border-2 border-brand-900 shadow-neo border-2 border-brand-900 shadow-neo', 'border-2 border-brand-900 shadow-neo', content)

        # Some buttons had `shadow-neo" border-2... ` appended outside the quote?
        content = re.sub(r'shadow-neo"\s+border-2 border-brand-900 shadow-neo active:translate-x-\[2px\] active:translate-y-\[2px\] active:shadow-neo-sm font-bold\s*>', ' border-2 border-brand-900 shadow-neo active:translate-x-[2px] active:translate-y-[2px] active:shadow-neo-sm font-bold">', content)
        content = re.sub(r'shadow-neo-input"\s+border-2 border-brand-900 shadow-\[2px_2px_0px_#000000\]\s*/>', ' border-2 border-brand-900 shadow-neo-input" />', content)
        content = re.sub(r'shadow-neo-input"\s+border-2 border-brand-900 shadow-\[2px_2px_0px_#000000\]\s*>', ' border-2 border-brand-900 shadow-neo-input">', content)
        content = re.sub(r'shadow-neo"\s+shadow-neo', 'shadow-neo"', content)

        # Cancel button in MainTaskTable was missed? It says <button type="button" onClick={...} className="px-4 py-2 text-brand-light/70 hover:text-brand-light">Cancel</button>
        # That wasn't touched because it didn't have border-brand-900? My button regex matched `<button[^>]*className="[^"]*"` and appended.
        # Let's fix that.

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
