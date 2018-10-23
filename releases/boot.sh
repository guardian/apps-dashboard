#!/bin/bash

echo Cmd click http://localhost:8000
echo Access on network http://$(ifconfig | grep -o 10.249.[0-9]*.[0-9]* | head -1):8000
/usr/bin/python -m SimpleHTTPServer 8000
