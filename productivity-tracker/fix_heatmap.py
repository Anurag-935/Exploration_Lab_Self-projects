import sys

with open("src/components/CalendarHeatmap.tsx", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace('rounded-md border flex', 'rounded-md border-2 border-brand-900 flex')
# Clean up duplicate borders if they existed
text = text.replace('border-2 border-brand-900 flex', 'border-2 border-brand-900 flex')

with open("src/components/CalendarHeatmap.tsx", "w", encoding="utf-8") as f:
    f.write(text)
