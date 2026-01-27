# use USB stick to install ubuntu DO NOT USE GIT SSH KEY UNLESS YOU LIKE FAILING
# find IP of machine I used static ip <wired_IP_address> you can change this in the first file in /etc/netplan
# network:
#  version: 2
#  ethernets:
#    eno1:
#      dhcp4: false
#      addresses:
#        - <wired_IP_address>/24
#      routes:
#        - to: default
#          via: <wired_IP_gateway>
#      nameservers:
#        addresses: [8.8.8.8, 1.1.1.1]
# log in with laptop from local LAN
# from a local LAN computer, go to users/frothbeast/.ssh/known_hosts/  get rid of all lines(keys) with this IP address

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