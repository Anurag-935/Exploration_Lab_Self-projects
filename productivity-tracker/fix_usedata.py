import sys

with open("src/hooks/useData.ts", "r", encoding="utf-8") as f:
    text = f.read()

# Remove setLoading(true) from fetchData so it doesn't wipe the UI
text = text.replace("setLoading(true)", "if (tasks.length === 0) setLoading(true)")

with open("src/hooks/useData.ts", "w", encoding="utf-8") as f:
    f.write(text)
