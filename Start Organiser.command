#!/bin/bash
# Sophos Personal Organiser — macOS Launcher
# Double-click this file in Finder to start the organiser.

cd "$(dirname "$0")"

echo ""
echo "  Starting Sophos Personal Organiser..."
echo ""

# Check for Python 3
if ! command -v python3 &> /dev/null; then
    echo "  Python 3 is required but not found."
    echo "  Install Xcode Command Line Tools by running:"
    echo ""
    echo "    xcode-select --install"
    echo ""
    echo "  Then try again."
    read -p "  Press Enter to exit..."
    exit 1
fi

# Start server in background, open browser, wait
python3 server.py &
SERVER_PID=$!

sleep 2
open "http://localhost:8080"

echo "  Browser opened. Keep this terminal window open."
echo "  Press Ctrl+C or close this window to stop."
echo ""

# Wait for server process (keeps terminal alive)
wait $SERVER_PID
