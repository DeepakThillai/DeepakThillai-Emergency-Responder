#!/bin/bash
set -e

echo "================================================"
echo " Emergency Responder Dashboard - Install"
echo "================================================"
echo ""

echo "[1/3] Installing Backend dependencies..."
cd "$(dirname "$0")/backend"
npm install
echo ""

echo "[2/3] Installing Simulator dependencies..."
cd "../simulator"
npm install
echo ""

echo "[3/3] Installing Frontend dependencies..."
cd "../frontend"
npm install
echo ""

echo "================================================"
echo " ✅  All dependencies installed!"
echo " Now run: ./start-all.sh  (or see README.md)"
echo "================================================"
