import sys
import re

with open("src/components/MainTaskTable.tsx", "r", encoding="utf-8") as f:
    text = f.read()

pattern = r'    const activeTasks = tasks\.filter\(t => \{.*?return true\n  \}\)\n'
text = re.sub(pattern, '    const activeTasks = tasks\n', text, flags=re.DOTALL)

with open("src/components/MainTaskTable.tsx", "w", encoding="utf-8") as f:
    f.write(text)
