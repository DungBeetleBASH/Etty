'use strict';

function Etty(client) {
    this.client = client;
}

Etty.prototype.search = function(term, done) {

    const params = {
        TableName: 'etymology',
        FilterExpression : 'begins_with(word, :word)',
        ExpressionAttributeValues : { ':word' : `${term}` },
        AttributesToGet: [ 'etymology', 'pos' ]
    };

    this.client.scan(params, (err, data) => {
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

        response.term = term;
        response.text = `There ${be} ${count} result${s}`;
        response.results = data.Items.map(item => {
            return {
                pos: item.pos,
                etymology: item.etymology
            };
        });
    }
    return response;
}

module.exports = function(client) {
    return new Etty(client);
};