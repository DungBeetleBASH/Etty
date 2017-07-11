'use strict';
const AWS = require('aws-sdk');
AWS.config.update({region:'us-west-2'});
const dynamo = new AWS.DynamoDB.DocumentClient();

exports.search = (term, done) => {

    var params = {
        TableName: 'etymology',
        FilterExpression : 'begins_with(word, :word)',
        ExpressionAttributeValues : { ':word' : `${term}` },
        Limit: 3
    };

    console.log(JSON.stringify(params));

    dynamo.scan(params, (err, data) => {
        if (err) {
            return done(err);
        }
        done(null, makeResponse(term, data));
    });

};

function makeResponse(term, data) {
    const count = data.Count;
    let response = {};
    if (count === 0) {
        response.text = 'Sorry, no results.';
        response.results = [];
    } else {
        const s = count === 1 ? '' : 's';
        const be = count === 1 ? 'is' : 'are';

        response.text = `There ${be} ${count} result${s}`;
        response.results = data.Items.map(item => {
            const pos = item.pos;
            const etymology = item.etymology;
            return `${term} - ${pos} - ${etymology}`;

        });
    }
    return response;
}