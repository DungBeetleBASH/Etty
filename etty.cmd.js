'use strict';
/*eslint no-console:0*/
const etty = require('./etty.dynamo');
const term = process.argv.slice(2).join(' ');

console.log(term);

etty.search(term, function(err, result) {
    console.log(JSON.stringify(err, null, 4));
    console.log(JSON.stringify(result, null, 4));
});