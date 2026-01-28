#
# This file is my guide to setting up a server from scratch
#

GIT_USER="frothbeast"
GIT_EMAIL="frothbeast@gmail.com"
GIT_REPO_URL="https://github.com/Frothbeast/IOTServer.git"
TARGET_DIR="/opt/IOTServer"

## use USB stick to install ubuntu DO NOT USE GIT SSH KEY UNLESS YOU LIKE FAILING
## find IP of machine I used static ip <wired_IP_address> you can change this in the first file in /etc/netplan
## network:
##  version: 2
##  ethernets:
##    eno1:     ###<<<------- This may have a different name
##      dhcp4: false
##      addresses:
##        - <wired_IP_address>/24
##      routes:
##        - to: default
##          via: <wired_IP_gateway>
##      nameservers:
##        addresses: [8.8.8.8, 1.1.1.1]
## log in with laptop from local LAN
## from a local LAN computer, go to users/frothbeast/.ssh/known_hosts/  get rid of all lines(keys) with this IP address

#update Linux
sudo apt update
sudo apt upgrade -y
# Install Git and pull repo
sudo apt install -y git
git config --global user.name "$GIT_USER"
git config --global user.email "$GIT_EMAIL"
if [ ! -d "$TARGET_DIR" ]; then
    sudo mkdir -p "$TARGET_DIR"
    sudo chown -R $USER:$USER "$TARGET_DIR"
    git clone "$GIT_REPO_URL" "$TARGET_DIR"
else
    echo "Directory $TARGET_DIR already exists. Skipping clone."
fi

#Tell self to execute the main setup script after creating .env files
echo "create .env files in server and client using .env.example"
echo "then go to $TARGET_DIR and run ./scripts/setup.sh"

cd "$TARGET_DIR" && chmod +x scripts/setup.sh 
