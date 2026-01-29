# [2026-01-29] Always include all the code I write in the first place, and comment out my code that you change and insert your new correction.

# 2. Run the database setup script
sudo chmod +x setup_db.sh
./setup_db.sh

# 3. Setup Python Environment
sudo apt install -y python3-venv
cd ../server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Clean PM2
sudo rm -f /usr/local/bin/pm2
sudo rm -rf /usr/local/lib/node_modules/pm2
sudo rm -rf /usr/local/lib/node_modules/.pm2*

# Setup Node/React
cd ../client/
sudo apt install -y npm
sudo npm install -g pm2 serve

# Restore Link
sudo ln -sf $(npm config get prefix)/lib/node_modules/pm2/bin/pm2 /usr/local/bin/pm2
PM2_BIN="/usr/local/bin/pm2"

# Build Frontend
npm install
npm run build

# Firewall
sudo ufw allow 3000/tcp
sudo ufw allow 5000/tcp

# Start Processes
cd /opt/IOTServer/server
$PM2_BIN delete "iot-collector" || true
$PM2_BIN start venv/bin/python --name "iot-collector" -- pythonDataCollector.py

# $PM2_BIN delete "iot-api" || true
# $PM2_BIN start venv/bin/python --name "iot-api" -- app.py
$PM2_BIN delete "iot-api" || true
$PM2_BIN start venv/bin/python --name "iot-api" -- sumpPumpWifiAPI.py

# Start the Frontend server using the 'serve' package
# /usr/local/bin/pm2 delete "iot-frontend" || true
$PM2_BIN delete "iot-frontend" || true
/usr/local/bin/pm2 start "npx serve -s /opt/IOTServer/client/build -l 3000" --name "iot-frontend"
$PM2_BIN save
cd ..
