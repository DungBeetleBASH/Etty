'use strict';
const AWS = require('aws-sdk');
AWS.config.update({region:'us-west-2'});
const dynamo = new AWS.DynamoDB.DocumentClient();
const table = 'etymology';

// TODO 
const term = process.argv.slice(2).join(' ');
console.log(term);

var params = {
    TableName: 'etymology',
    FilterExpression : 'word = :word',
    ExpressionAttributeValues : { ':word' : term },
    Limit: 5
};

dynamo.scan(params, function(err, data) {
    if (err) {
        return console.log('err', JSON.stringify(err, null, 4));
    }
    const count = data.Count;
    if (count === 0) {
        return console.log('Sorry, no results.');
    }
    const s = count === 1 ? '' : 's';
    const be = count === 1 ? 'is' : 'are';
    const pos = data.Items[0].pos;
    const etymology = data.Items[0].etymology;
    console.log(`There ${be} ${count} result${s}`);
    console.log(`${term} - ${pos} - ${etymology}`);
});