#!/bin/bash
# Starts backend, simulator, and frontend in separate terminals.
# Works on macOS (Terminal.app / iTerm2) and Linux with gnome-terminal or xterm.

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "================================================"
echo " Emergency Responder Dashboard - Starting"
echo "================================================"
echo ""
echo "Starting 3 processes:"
echo "  1. Backend API       → http://localhost:5000"
echo "  2. Simulation Engine → writes to MongoDB every 10s"
echo "  3. Frontend          → http://localhost:5173"
echo ""

# ── macOS ──────────────────────────────────────────
if [[ "$OSTYPE" == "darwin"* ]]; then
  osascript -e "tell application \"Terminal\" to do script \"cd '$ROOT/backend' && npm start\""
  sleep 2
  osascript -e "tell application \"Terminal\" to do script \"cd '$ROOT/simulator' && npm start\""
  sleep 1
  osascript -e "tell application \"Terminal\" to do script \"cd '$ROOT/frontend' && npm run dev\""

# ── Linux with gnome-terminal ───────────────────────
elif command -v gnome-terminal &>/dev/null; then
  gnome-terminal --title="Backend API"       -- bash -c "cd '$ROOT/backend'   && npm start; read"
  gnome-terminal --title="Simulator Engine"  -- bash -c "cd '$ROOT/simulator' && npm start; read"
  gnome-terminal --title="Frontend"          -- bash -c "cd '$ROOT/frontend'  && npm run dev; read"

# ── Fallback: run all in background with logs ───────
else
  mkdir -p "$ROOT/logs"
  echo "No GUI terminal detected — running in background. Logs → ./logs/"
  cd "$ROOT/backend"   && npm start > "$ROOT/logs/backend.log"   2>&1 &
  sleep 2
  cd "$ROOT/simulator" && npm start > "$ROOT/logs/simulator.log" 2>&1 &
  sleep 1
  cd "$ROOT/frontend"  && npm run dev > "$ROOT/logs/frontend.log" 2>&1 &
  echo ""
  echo "PIDs saved. To stop all: kill \$(cat '$ROOT/logs/pids.txt')"
  echo $! >> "$ROOT/logs/pids.txt"
fi

echo ""
echo "✅  All processes launched."
echo "   Open http://localhost:5173 in your browser."
