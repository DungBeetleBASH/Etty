'use strict';
const AWS = require('aws-sdk');
const parse = AWS.DynamoDB.Converter.output;

function Etty(client, db) {
    this.client = client;
    this.db = db;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

Etty.prototype.search = function(term, done) {

    const params = {
        TableName: 'etymology',
        KeyConditionExpression: 'normalised = :normalised',
        ExpressionAttributeValues: {
            ':normalised': {
                S: `${term}`
            }
        },
        ProjectionExpression: 'entries, word',
        ScanIndexForward: false
    };

    this.db.query(params, (err, data) => {
        if (err) {
            return done(err);
        }
        done(null, makeResponse(term, makeNative(data)));
    });

};

Etty.prototype.getIndexCount = function(indexName, done) {

    const params = {
        TableName: 'etymology'
    };

    this.db.describeTable(params, (err, data) => {
        let index = {};
        if (err) {
            return done(err);
        }
        if (data && data.Table && data.Table.GlobalSecondaryIndexes) {
            index = data.Table.GlobalSecondaryIndexes.reduce((acc, gsi) => {
                return (gsi.IndexName === indexName) ? gsi : acc;
            }, {});
        }
        let count = index.ItemCount || 0;
        done(null, count);
    });

};

Etty.prototype.random = function(done) {
    const wordIdIndex = 'wordId-index';

    this.getIndexCount(wordIdIndex, (err, count) => {
        if (err || !count) {
            return done('Failed to get index count');
        }
        let idx = getRandomInt(1, count);

        const params = {
            TableName: 'etymology',
            IndexName: wordIdIndex,
            KeyConditionExpression: 'wordId = :wordId',
            ExpressionAttributeValues: {
                ':wordId': {
                    N: `${idx}`
                }
            },
            ProjectionExpression: 'entries, word',
            ScanIndexForward: false
        };

        this.db.query(params, (err, data) => {
            if (err) {
                return done(err);
            }
            done(null, makeResponse('', makeNative(data)));
        });

    });

};

function makeNative(data) {
    let item = {};
    if (data.Items && data.Items[0] && data.Items[0]) {
        item = data.Items && data.Items[0] && data.Items[0];
    }
    const entries = (item.entries && item.entries.L) ? item.entries.L.map(entry => parse(entry)) : [];
    const word = (item.word && item.word.S) ? item.word.S : '';
    return {
        Item: {
            entries: entries,
            word: word
        }
    };
}

function makeResponse(term, data) {
    const count = (data.Item && data.Item.entries) ? data.Item.entries.length : 0;
    const word = (data.Item && data.Item.word) ? data.Item.word : '';
    let response = {};
    if (count === 0) {
        response.text = (term) ? 'Sorry, no results for ' + term : 'Sorry, no results';
        response.results = [];
    } else {
        const s = count === 1 ? '' : 's';
        const be = count === 1 ? 'is' : 'are';

        response.term = word;
        response.text = `There ${be} ${count} result${s}`;
        response.results = data.Item.entries.map(item => {
            return {
                pos: item.pos,
                etymology: item.etymology
            };
        });
    }
    return response;
}

module.exports = (client, db) => new Etty(client, db);