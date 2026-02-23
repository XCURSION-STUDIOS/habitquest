#!/bin/bash
set -e
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
cp "$SCRIPT_DIR/src/App.jsx"                               src/App.jsx
cp "$SCRIPT_DIR/src/components/layout/Header.jsx"          src/components/layout/Header.jsx
cp "$SCRIPT_DIR/src/components/ui/GlobalCSS.jsx"           src/components/ui/GlobalCSS.jsx
cp "$SCRIPT_DIR/src/screens/StatusScreen.jsx"              src/screens/StatusScreen.jsx
cp "$SCRIPT_DIR/src/screens/DailyScreen.jsx"               src/screens/DailyScreen.jsx
echo "Done! Run: npm run dev"
