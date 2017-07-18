/*global describe, it, beforeEach, afterEach */
const assert = require('chai').assert;
const sinon = require('sinon');
let client = {
    scan: function() {}
};
const etty = require('../src/etty.dynamo')(client);

describe('etty.dynamo', function() {
    const term = 'ill-gotten';
    const successResponse = {
        Count: 1,
        Items: [
            {
                pos: 'n',
                etymology: 'word etymology'
            }
        ]
    };
    const noResults = {
        Count: 0
    };
    const error = {
        message: ''
    };
    let scanStub;

    beforeEach(function() {
        scanStub = sinon.stub(client, 'scan');
    });

    afterEach(function() {
        scanStub.restore();
    });

    describe('search()', function() {

        it('should return a successful response', function(done) {
            scanStub.yields(null, successResponse);

            etty.search(term, function(err, result) {
                assert.isNull(err);
                assert.deepEqual(result, {
                    text: 'There is 1 result',
                    results: [ 'ill-gotten - n - word etymology' ] 
                });
                done();
            });
        });

        it('should return no results', function(done) {
            scanStub.yields(null, noResults);

            etty.search(term, function(err, result) {
                assert.isNull(err);
                assert.deepEqual(result, {
                    text: 'Sorry, no results.',
                    results: []
                });
                done();
            });
        });

        it('should return an error', function(done) {
            scanStub.yields(error, {});

            etty.search(term, function(err) {
                assert.isNotNull(err);
                done();
            });
        });

    });

});