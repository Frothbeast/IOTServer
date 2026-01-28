
# 2. Run the database setup script
chmod +x scripts/setup_db.sh
./scripts/setup_db.sh

# 3. Setup Python Environment
sudo apt install -y python3-venv

cd server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Setup Node/React
sudo apt install -y npm
sudo npm install -g pm2
npm run build
cd server
pm2 start venv/bin/python --name "iot-collector" -- pythonDataCollector.py
pm2 startup | tail -n 1 | bash
pm2 save
cd ..