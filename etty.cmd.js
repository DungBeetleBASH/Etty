'use strict';
/*eslint no-console:0*/
const AWS = require('aws-sdk');
AWS.config.update({region:'us-west-2'});
const client = new AWS.DynamoDB.DocumentClient();
const etty = require('./etty.dynamo')(client);
const term = process.argv.slice(2).join(' ');

console.log(term);

etty.search(term, function(err, result) {
    console.log(JSON.stringify(err, null, 4));
    console.log(JSON.stringify(result, null, 4));
});