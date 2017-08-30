#!/bin/bash

rm -rf src/deploy 2> /dev/null && mkdir src/deploy

zip -r src/deploy/etty.zip src/etty.dynamo.js src/handlers.js src/index.js src/language.json src/node_modules

if [ -f src/deploy/etty.zip ]
then
	echo "zip exists"
else
	echo "zip not found"
fi