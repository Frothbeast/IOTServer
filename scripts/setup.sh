sudo apt update
sudo apt upgrade

# 1. Create directory and get project files
sudo mkdir -p /opt/frothbeast/
sudo chown -R $USER:$USER /opt/frothbeast
cd /opt/frothbeast/

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

# 4. Setup Node/React
sudo apt install -y npm