/*global describe, it, beforeEach, afterEach */
const assert = require('chai').assert;
const sinon = require('sinon');
let client = {
    get: function() {}
};
let db = {};
const etty = require('../src/etty.dynamo')(client, db);

describe('etty.dynamo', function() {
    const term = 'ill-gotten';
    const successResponse = {
        Item: {
            entries: [
                {
                    pos: 'n',
                    etymology: 'word etymology'
                }
            ],
            word: term
        }
    };
    const noResults = {
        Count: 0
    };
    const error = {
        message: ''
    };
    let getStub;

    beforeEach(function() {
        getStub = sinon.stub(client, 'get');
    });

    afterEach(function() {
        getStub.restore();
    });

    describe('search()', function() {

        it('should return a successful response', function(done) {
            getStub.yields(null, successResponse);

            etty.search(term, function(err, result) {
                assert.isNull(err);
                assert.deepEqual(result, {
                    term: 'ill-gotten',
                    text: 'There is 1 result',
                    results: [ 
                        {
                            pos: 'n',
                            etymology: 'word etymology'
                        }
                    ] 
                });
                done();
            });
        });

        it('should return no results', function(done) {
            getStub.yields(null, noResults);

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
            getStub.yields(error, {});

            etty.search(term, function(err) {
                assert.isNotNull(err);
                done();
            });
        });

    });

});