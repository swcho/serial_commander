#!/usr/bin/node

var api = require('./index.js');
var argv = require('optimist')
    .alias('p', 'port')
    .alias('c', 'command')
    .argv;


api.init(argv.p, function() {
    if (argv.c) {
        api.run_command_mode(argv.c);
    } else {
        api.run_interactive_mode();
    }
});
