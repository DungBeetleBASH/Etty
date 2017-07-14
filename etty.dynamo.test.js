/*global describe, it, beforeEach */
const assert = require('chai').assert;
const sinon = require('sinon');
const ettyDynamo = require('./etty.dynamo');

describe('etty.dynamo', function() {
    let etty;
    let client;
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

    beforeEach(function() {
        etty = ettyDynamo(client);
        client = {
            search: sinon.stub()
        };
    });

    describe('search()', function() {

        it('should return a successful response', function(done) {
            client.search.yields(null, successResponse);
            done();

            etty.search(term, function(err, result) {
                assert.isNull(err);
                assert.equal(result, 'ill-gotten - n - word etymology');
                done();
            });
        });

        it('should return no results', function(done) {
            client.search.yields(null, noResults);
            done();

            etty.search(term, function(err, result) {
                assert.isNull(err);
                assert.equal(result, 'Sorry, no results.');
                done();
            });
        });

        it('should return an error', function(done) {
            client.search.yields(error, {});
            done();

            etty.search(term, function(err) {
                assert.isNotNull(err);
                done();
            });
        });

    });

});