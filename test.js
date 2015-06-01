#!/usr/bin/node

var api = require('./index.js');
api.init('/dev/ttyS0', function() {
    api.run_command('ll', function(line) {
        console.log(line);
    });
});

