#!/usr/bin/node

var api = require('./index.js');
var argv = require('optimist')
    .alias('p', 'port')
    .alias('c', 'command')
    .argv;

function printUsage() {
    console.log('serial-commander -p /dev/ttyUSB0 -c ls');
    process.exit();
}

if (!argv.p) {
    printUsage();
}

api.init(argv.p, function() {
    if (argv.c) {
        api.run_command_mode(argv.c);
    } else {
        api.run_interactive_mode();
    }
});

