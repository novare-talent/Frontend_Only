#!/bin/bash

# Lighthouse Test Script for Novare Talent
# This script builds the app and runs Lighthouse tests

echo "🚀 Starting Lighthouse Test Process..."
echo ""

# Check if lighthouse is installed
if ! command -v lighthouse &> /dev/null; then
    echo "⚠️  Lighthouse CLI not found. Installing..."
    npm install -g lighthouse
fi

# Build the production version
echo "📦 Building production version..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi

# Start the production server in background
echo "🌐 Starting production server..."
npm start &
SERVER_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 5

# Create reports directory
mkdir -p ./lighthouse-reports

# Run Lighthouse tests
echo ""
echo "🔍 Running Lighthouse tests..."
echo ""

# Desktop test
echo "📊 Running Desktop test..."
lighthouse http://localhost:3000 \
  --preset=desktop \
  --output=html \
  --output=json \
  --output-path=./lighthouse-reports/desktop \
  --chrome-flags="--headless" \
  --quiet

# Mobile test
echo "📱 Running Mobile test..."
lighthouse http://localhost:3000 \
  --output=html \
  --output=json \
  --output-path=./lighthouse-reports/mobile \
  --chrome-flags="--headless" \
  --quiet

# Kill the server
echo ""
echo "🛑 Stopping production server..."
kill $SERVER_PID

# Display results
echo ""
echo "✅ Lighthouse tests completed!"
echo ""
echo "📊 Reports saved to:"
echo "   - Desktop: ./lighthouse-reports/desktop.html"
echo "   - Mobile:  ./lighthouse-reports/mobile.html"
echo ""
echo "🌐 Open reports in browser:"
echo "   open ./lighthouse-reports/desktop.html"
echo "   open ./lighthouse-reports/mobile.html"
echo ""

# Parse and display scores
if command -v jq &> /dev/null; then
    echo "📈 Desktop Scores:"
    jq '.categories | to_entries | .[] | "\(.key): \(.value.score * 100)"' ./lighthouse-reports/desktop.json
    echo ""
    echo "📈 Mobile Scores:"
    jq '.categories | to_entries | .[] | "\(.key): \(.value.score * 100)"' ./lighthouse-reports/mobile.json
else
    echo "💡 Install jq to see scores in terminal: brew install jq"
fi

echo ""
echo "🎯 Target: 95+ on all metrics"
echo "✨ Done!"
