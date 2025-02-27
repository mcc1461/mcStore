#!/bin/bash

# Navigate to your local repository directory.
cd /home/ubuntu/mcStore || { echo "Error: Repository directory not found"; exit 1; }

# Pull the latest changes from GitHub.
git pull origin main

# Install any new dependencies.
npm install

# OPTIONAL: If you need to build your Vite client for production, uncomment these lines.
cd client
npm run build
cd ..

# Restart your server process using PM2, updating the environment variables.
pm2 restart mcStore --update-env
