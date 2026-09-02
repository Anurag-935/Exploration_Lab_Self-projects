import sys
import re

with open("src/components/ProjectDetail.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Remove the interaction classes from type="range"
text = text.replace('type="range" \n                min="0" \n                max="100" \n                step="any"\n                value={progress}\n                onChange={(e) => setProgress(Number(e.target.value))}\n                onMouseUp={(e) => handleProgressChange(Math.round(Number(e.currentTarget.value)))}\n                onTouchEnd={(e) => handleProgressChange(Math.round(Number(e.currentTarget.value)))}\n                className="w-full accent-brand-500 h-2 bg-brand-900/30 rounded-lg appearance-none cursor-pointer border-2 border-brand-900 shadow-neo-input "', 'type="range" \n                min="0" \n                max="100" \n                step="any"\n                value={progress}\n                onChange={(e) => setProgress(Number(e.target.value))}\n                onMouseUp={(e) => handleProgressChange(Math.round(Number(e.currentTarget.value)))}\n                onTouchEnd={(e) => handleProgressChange(Math.round(Number(e.currentTarget.value)))}\n                className="w-full accent-brand-500 h-2 bg-brand-900/30 rounded-lg appearance-none cursor-pointer"')

# Fix the button border duplication
text = text.replace('border border-brand-500/30 rounded-xl p-4 transition-all font-medium text-sm gap-2 border-2 border-brand-900 shadow-neo', 'rounded-xl p-4 transition-all font-medium text-sm gap-2 border-2 border-brand-900 shadow-neo')

with open("src/components/ProjectDetail.tsx", "w", encoding="utf-8") as f:
    f.write(text)
