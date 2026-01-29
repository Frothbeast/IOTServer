
# 2. Run the database setup script
sudo chmod +x setup_db.sh
./setup_db.sh

# 3. Setup Python Environment
sudo apt install -y python3-venv

cd ../server

python3 -m venv venv

source venv/bin/activate

pip install -r requirements.txt
sudo rm -f /usr/local/bin/pm2
sudo rm -rf /usr/local/lib/node_modules/pm2
sudo rm -rf /usr/local/lib/node_modules/.pm2*
cd ../client/
sudo rm -rf /usr/local/lib/node_modules/pm2

# Setup Node/React
sudo apt install -y npm

pwd
echo "sudo apt install -y npm"

sudo npm install -g pm2
sudo ln -sf $(npm config get prefix)/lib/node_modules/pm2/bin/pm2 /usr/local/bin/pm2
pwd
echo "PM2_BIN="/usr/local/bin/pm2"

PM2_BIN="/usr/local/bin/pm2"
cd /opt/IOTServer/server
$PM2_BIN delete "iot-collector" || true
$PM2_BIN start venv/bin/python --name "iot-collector" -- pythonDataCollector.py

$PM2_BIN delete "iot-api" || true
$PM2_BIN start venv/bin/python --name "iot-api" -- app.py

$PM2_BIN save
pwd
npm install
echo "npm install -g pm2"
npm run build

pwd
echo "npm run build"

pm2 start venv/bin/python --name "iot-collector" -- pythonDataCollector.py
pm2 startup | tail -n 1 | bash
pm2 save
cd ..