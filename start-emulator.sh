#!/usr/bin/env bash
# Starts the Firebase Firestore emulator for local development.
# The app will auto-detect and connect when running on localhost.

JAVA_HOME="${JAVA_HOME:-$(dirname $(readlink -f $(which java 2>/dev/null || echo /dev/null)))/..}"
export JAVA_HOME

if ! command -v firebase &>/dev/null; then
  echo "firebase-tools not found. Install with: npm install -g firebase-tools"
  exit 1
fi

cd "$(dirname "$0")"
echo "Starting Firestore emulator on port 8085..."
firebase emulators:start --project demo-sprint-engine
