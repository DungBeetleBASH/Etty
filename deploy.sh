#!/bin/bash

rm -rf deploy 2> /dev/null && mkdir deploy

zip -r deploy/etty.zip src/etty.dynamo.js src/handlers.js src/index.js src/language.json src/node_modules

if [ -f deploy/etty.zip ]
then
	echo "Build artefact created."
else
	echo "Error: build artefact not created."
fi