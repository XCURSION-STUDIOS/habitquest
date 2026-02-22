#!/bin/bash
# Patch: Rename Shadow Missions → Bonus Missions, higher rewards, no penalty

echo "Renaming Shadow Missions → Bonus Missions..."

# ── 1. Global text rename across all source files ────────────
find src/ -name "*.jsx" -o -name "*.js" | while read f; do
  sed -i \
    -e 's/shadowMission/bonusMission/g' \
    -e 's/shadowProgress/bonusProgress/g' \
    -e 's/Shadow Mission/Bonus Mission/g' \
    -e 's/SHADOW MISSION/BONUS MISSION/g' \
    -e 's/Shadow Directive/Bonus Mission/g' \
    -e 's/SHADOW DIRECTIVE/BONUS MISSION/g' \
    "$f"
  echo "  processed: $f"
done

# ── 2. Rename the component file ─────────────────────────────
if [ -f "src/components/layout/ShadowMissionBar.jsx" ]; then
  cp src/components/layout/ShadowMissionBar.jsx src/components/layout/BonusMissionBar.jsx
  echo "Copied: ShadowMissionBar.jsx → BonusMissionBar.jsx"
fi

# ── 3. Update imports to point to new filename ───────────────
python3 << 'PYEOF'
import os, glob

for fp in glob.glob('src/**/*.jsx', recursive=True) + glob.glob('src/**/*.js', recursive=True):
    with open(fp, 'r') as f:
        content = f.read()
    new = content.replace('ShadowMissionBar', 'BonusMissionBar')
    if new != content:
        with open(fp, 'w') as f:
            f.write(new)
        print(f"Import updated: {fp}")
PYEOF

# ── 4. Boost Bonus Mission rewards to 5x (was 3x normal quests) ──
python3 << 'PYEOF'
import os, re

files = ['src/lib/ai.js', 'src/lib/gameLogic.js']

for fp in files:
    if not os.path.exists(fp): continue
    with open(fp, 'r') as f:
        content = f.read()

    # Boost wherever bonus mission XP/gems are assigned
    # Pattern: xp: cfg.xp * N  → xp: cfg.xp * 5
    original = content
    content = re.sub(
        r'(bonusMission.*?xp:\s*cfg\.xp\s*\*\s*)\d+',
        r'\g<1>5',
        content,
        flags=re.DOTALL
    )
    content = re.sub(
        r'(bonusMission.*?gems:\s*cfg\.gems\s*\*\s*)\d+',
        r'\g<1>5',
        content,
        flags=re.DOTALL
    )

    if content != original:
        with open(fp, 'w') as f:
            f.write(content)
        print(f"Rewards boosted: {fp}")
    else:
        print(f"No reward pattern found: {fp}")
PYEOF

# ── 5. Remove any abyss penalty for missing bonus missions ───
python3 << 'PYEOF'
with open('src/lib/gameLogic.js', 'r') as f:
    content = f.read()

import re

# Remove any line that increases abyssDepth because of a missed bonus mission
content = re.sub(
    r'.*bonusMission.*abyss.*\n', '', content, flags=re.IGNORECASE
)
content = re.sub(
    r'.*abyss.*bonusMission.*\n', '', content, flags=re.IGNORECASE
)

with open('src/lib/gameLogic.js', 'w') as f:
    f.write(content)
print("Penalty logic cleaned")
PYEOF

# ── 6. Update BonusMissionBar display text ───────────────────
python3 << 'PYEOF'
import os
fp = 'src/components/layout/BonusMissionBar.jsx'
if not os.path.exists(fp):
    print(f"SKIP: {fp}")
else:
    with open(fp, 'r') as f:
        content = f.read()

    # Add OPTIONAL tag near the mission title
    content = content.replace(
        'BONUS MISSION',
        'BONUS MISSION · OPTIONAL'
    )
    # Only do it once for display, not all instances
    content = content.replace(
        'BONUS MISSION · OPTIONAL · OPTIONAL',
        'BONUS MISSION · OPTIONAL'
    )

    with open(fp, 'w') as f:
        f.write(content)
    print("BonusMissionBar display updated")
PYEOF

echo ""
echo "✅ Done! Bonus Missions renamed and rebalanced:"
echo "  - All 'Shadow Mission' references renamed to 'Bonus Mission'"
echo "  - Rewards: 5x XP and gems vs normal quests"
echo "  - No abyss penalty for missing"
echo "  - Labelled OPTIONAL in the UI"
echo "  - Still expire at midnight rollover (creates urgency)"
echo ""
echo "Run: npm run build 2>&1 | head -20"