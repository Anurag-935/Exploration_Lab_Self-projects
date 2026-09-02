import sys

with open("src/components/RadarStats.tsx", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace('stroke="#5A1420"', 'stroke="#000000"')
text = text.replace("fill: '#EFE7DE'", "fill: '#1A1A1A'")

with open("src/components/RadarStats.tsx", "w", encoding="utf-8") as f:
    f.write(text)

with open("src/components/MonthlyLineGraph.tsx", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace('stroke="#5A1420"', 'stroke="#000000"')
text = text.replace('stroke="#EFE7DE"', 'stroke="#1A1A1A"')
text = text.replace("backgroundColor: '#2A2A2B'", "backgroundColor: '#FFFFFF'")
text = text.replace("border: '1px solid #5A1420'", "border: '2px solid #000000', boxShadow: '4px 4px 0px #000000'")
text = text.replace("color: '#EFE7DE'", "color: '#1A1A1A'")
text = text.replace("strokeDasharray=\"3 3\"", "") # Solid lines for neobrutalism

with open("src/components/MonthlyLineGraph.tsx", "w", encoding="utf-8") as f:
    f.write(text)
