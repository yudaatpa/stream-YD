#!/usr/bin/env bash
set -e
echo "Installing dependencies..."
npm install
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi
echo "Run: node app.js"
