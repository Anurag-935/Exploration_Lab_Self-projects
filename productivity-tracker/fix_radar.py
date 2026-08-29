import sys

with open("src/components/RadarStats.tsx", "r", encoding="utf-8") as f:
    text = f.read()

old_logic = """    const data = AXES.map(name => {
      const xp = xpMap[name] || 0
      
      // Calculate level using the exponential threshold curve
      const levelFloat = Math.pow(xp / XP_BASE, 1 / XP_EXPONENT) + 1
      const level = Math.floor(levelFloat)
      
      if (level > maxLevel) maxLevel = level

      return {
        name,
        xp,
        level
      }
    })"""
new_logic = """    const data = AXES.map(name => {
      const xp = xpMap[name] || 0
      
      // Calculate level using the exponential threshold curve
      const levelFloat = Math.pow(xp / XP_BASE, 1 / XP_EXPONENT) + 1
      const level = Math.floor(levelFloat)
      
      if (level > maxLevel) maxLevel = level

      return {
        name,
        xp,
        level,
        displayLevel: levelFloat // use the float for fluid visual growth!
      }
    })"""
text = text.replace(old_logic, new_logic)

text = text.replace('<Radar name="Level" dataKey="level"', '<Radar name="Level" dataKey="displayLevel"')

with open("src/components/RadarStats.tsx", "w", encoding="utf-8") as f:
    f.write(text)
