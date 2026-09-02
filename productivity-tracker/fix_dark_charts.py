import sys

with open("src/components/RadarStats.tsx", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace('stroke="#000000"', 'stroke="#333333"') # Use a softer white/grey for the internal radar grid so it's not blinding
text = text.replace("fill: '#1A1A1A'", "fill: '#FFFFFF'")
text = text.replace('<PolarRadiusAxis angle={30} domain={[0, stats.maxVal]} tick={false} axisLine={false} />', '<PolarRadiusAxis angle={30} domain={[0, stats.maxVal]} tickCount={6} tick={false} axisLine={false} />')

with open("src/components/RadarStats.tsx", "w", encoding="utf-8") as f:
    f.write(text)

with open("src/components/MonthlyLineGraph.tsx", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace('stroke="#000000"', 'stroke="#333333"')
text = text.replace('stroke="#1A1A1A"', 'stroke="#FFFFFF"')
text = text.replace("backgroundColor: '#FFFFFF'", "backgroundColor: '#1A1A1A'")
text = text.replace("border: '2px solid #000000', boxShadow: '4px 4px 0px #000000'", "border: '2px solid #FFFFFF', boxShadow: '4px 4px 0px #FFFFFF'")
text = text.replace("color: '#1A1A1A'", "color: '#FFFFFF'")

with open("src/components/MonthlyLineGraph.tsx", "w", encoding="utf-8") as f:
    f.write(text)
