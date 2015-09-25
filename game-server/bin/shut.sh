#!/bin/sh
echo "kill all node app.js process..."
kill -9 `ps -ef|grep node | grep -v grep | grep 'app.js' | awk '{print $2}'`
