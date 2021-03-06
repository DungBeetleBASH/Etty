'use strict';
/*eslint no-console:0*/
const AWS = require('aws-sdk');
AWS.config.update({region:'eu-west-1'});
const client = new AWS.DynamoDB.DocumentClient();
const db = new AWS.DynamoDB();
const etty = require('./etty.dynamo')(client, db);
const term = process.argv.slice(2).join(' ');

console.log(term);

if (term) {

    etty.search(term, function (err, result) {
        console.log(JSON.stringify(err, null, 4));
        console.log(JSON.stringify(result, null, 4));
    });

} else {

    etty.random(function (err, result) {
        console.log(JSON.stringify(err, null, 4));
        console.log(JSON.stringify(result, null, 4));
    });

}