
# 2. Run the database setup script
sudo chmod +x setup_db.sh
.setup_db.sh

# 3. Setup Python Environment
sudo apt install -y python3-venv
pwd
echo "sudo apt install -y python3-venv"
cd server
pwd
echo "cd server"

python3 -m venv venv
pwd
echo "python3 -m venv venv"

source venv/bin/activate
pwd
echo "source venv/bin/activate"

pip install -r ../server/requirements.txt
pwd
echo "pip install -r ../server/requirements.txt"

cd ../client/
pwd
echo "sd ../client/"

# Setup Node/React
sudo apt install -y npm

pwd
echo "sudo apt install -y npm"
sudo npm install -g pm2
pwd
echo "npm install -g pm2"
npm run build

pwd
echo "npm run build"
cd server

pwd
echo "cd server"
pm2 start venv/bin/python --name "iot-collector" -- pythonDataCollector.py
pm2 startup | tail -n 1 | bash
pm2 save
cd ..