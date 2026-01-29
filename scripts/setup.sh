
# 2. Run the database setup script
sudo chmod +x setup_db.sh
./setup_db.sh

# 3. Setup Python Environment
sudo apt install -y python3-venv
pwd
echo "sudo apt install -y python3-venv"
cd ../server
pwd
echo "cd ../server"

python3 -m venv venv
pwd
echo "python3 -m venv venv"

source venv/bin/activate
pwd
echo "source venv/bin/activate"

pip install -r requirements.txt
pwd
echo "pip install -r requirements.txt"
sudo rm -f /usr/local/bin/pm2
sudo rm -rf /usr/local/lib/node_modules/pm2
sudo rm -rf /usr/local/lib/node_modules/.pm2*
cd ../client/
pwd
echo "sd ../client/"
sudo rm -rf /usr/local/lib/node_modules/pm2

# Setup Node/React
sudo apt install -y npm

pwd
echo "sudo apt install -y npm"

sudo npm install -g pm2
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