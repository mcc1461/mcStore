#!/bin/bash
# Navigate to project root
cd /home/ubuntu/mcStore || { echo "Project directory not found"; exit 1; }

# Pull latest changes from GitHub
git pull origin main

# Install server dependencies and restart backend (if necessary)
npm install

# Build the client for production
cd client
npm install
npm run build
cd ..

# Copy the production build to Nginx's root directory
sudo cp -R /home/ubuntu/mcStore/client/dist/* /var/www/softrealizer/

# Adjust permissions, if needed
sudo chown -R www-data:www-data /var/www/softrealizer
sudo chmod -R 755 /var/www/softrealizer

# Restart the backend process with PM2
pm2 restart musco-store --update-env

echo "Deployment completed."
    
