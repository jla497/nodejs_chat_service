#! /bin/bash

sudo apt-get update
sudo apt-get install bash
#check if nodejs is already installed
if which node > dev/null
then
  echo "Nodejs already installed, skipping..."
else
  # Build Latest Node.js
  sudo apt-get install build-essential
  cd ~
  curl -sL https://deb.nodesource.com/setup_8.x -o nodesource_setup.sh
  sudo bash nodesource_setup.sh
  sudo apt-get install -y nodejs
  rm node*.sh
fi

#pm2 manager
if which pm2 > dev/null
then
  echo "pm2 already installed, skipping..."
else
  sudo npm install -g pm2
fi

#start app
cd /home/vagrant/www/
sudo npm install

#check if server is already running
STARTED=$(pm2 list|grep server)
if [ -z "$STARTED" ] 
then
  sudo pm2 start server.js
else
  sudo pm2 restart server.js
fi
