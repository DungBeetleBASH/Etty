/*global describe, it, beforeEach, afterEach */
const assert = require('chai').assert;
const sinon = require('sinon');
const successResponse = require('./data/successResponse.json');
const noResults = require('./data/noResults.json');
let client = {
    get: function() {}
};
let db = {
    query: function() {}
};
const etty = require('../src/etty.dynamo')(client, db);

describe('etty.dynamo', function() {
    const term = 'ill-gotten';
    const error = {
        message: ''
    };
    let queryStub;

    beforeEach(function() {
        queryStub = sinon.stub(db, 'query');
    });

    afterEach(function() {
        queryStub.restore();
    });

    describe('search()', function() {

        it('should return a successful response', function(done) {
            let expected = {
                'term': 'ill-gotten',
                'text': 'There is 1 result',
                'results': [
                    {
                        'pos': 'adj',
                        'etymology': '1550s, from ill (adv.) + gotten.'
                    }
                ]
            };
            queryStub.yields(null, successResponse);

            etty.search(term, function(err, result) {
                assert.isNull(err);
                assert.deepEqual(result, expected);
                done();
            });
        });

        it('should return no results', function(done) {
            queryStub.yields(null, noResults);

            etty.search(term, function(err, result) {
                assert.isNull(err);
                assert.deepEqual(result, {
                    text: 'Sorry, no results for ' + term,
                    results: []
                });
                done();
            });
        });

        it('should return an error', function(done) {
            queryStub.yields(error, {});

            etty.search(term, function(err) {
                assert.isNotNull(err);
                done();
            });
        });

    });

});