import sys

# Update ProjectsGallery.tsx
with open("src/components/ProjectsGallery.tsx", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace('import { Project } from "../types"', 'import { Project } from "../types"\nimport { createPortal } from "react-dom"')

old_return = '  return (\n    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">'
new_return = '  return createPortal(\n    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">'
text = text.replace(old_return, new_return)

text = text.replace('      </div>\n    </div>\n  )', '      </div>\n    </div>,\n    document.body\n  )')

with open("src/components/ProjectsGallery.tsx", "w", encoding="utf-8") as f:
    f.write(text)

# Update ProjectDetail.tsx
with open("src/components/ProjectDetail.tsx", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace('import { Project, ProjectLog } from "../types"', 'import { Project, ProjectLog } from "../types"\nimport { createPortal } from "react-dom"')

old_return2 = '  return (\n    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">'
new_return2 = '  return createPortal(\n    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">'
text = text.replace(old_return2, new_return2)

text = text.replace('      </div>\n    </div>\n  )', '      </div>\n    </div>,\n    document.body\n  )')

with open("src/components/ProjectDetail.tsx", "w", encoding="utf-8") as f:
    f.write(text)
