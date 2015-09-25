#!/usr/bin/zsh
# start pomelo-cli 2.0 develop environment
echo "start chatofpomelo game-server"
cd ..
nohup node app.js env=development id=master-server-1 serverType=master host=127.0.0.1 port=3005 mode=stand-alone  1>/dev/null 2>&1 &
sleep 1
nohup node app.js env=development id=connector-server-1 host=127.0.0.1  port=4050 clientPort=3050 frontend=true serverType=connector >/dev/null 2>&1 &
sleep 1
nohup node app.js env=development id=chat-server-1 host=127.0.0.1  port=6050 serverType=chat >/dev/null 2>&1 &
sleep 1
nohup node app.js env=development id=gate-server-1 host=127.0.0.1 clientPort=3014 frontend=true serverType=gate >/dev/null 2>&1 &
sleep 1
echo "start chatofpomelo web-server"
cd ../web-server
nohup node app.js  1>/dev/null 2>&1 &
sleep 1
ps axu | grep node | grep -v 'grep'
