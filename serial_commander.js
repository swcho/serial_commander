#!/usr/bin/node

var api = require('./index.js');
var argv = require('optimist')
    .alias('p', 'port')
    .alias('c', 'command')
    .alias('u', 'until')
    .argv;

function printUsage() {
    console.log('serial-commander -p /dev/ttyUSB0 -c ls -u #');
    process.exit();
}

if (!argv.p) {
    printUsage();
}

api.init(argv.p, function() {
    if (argv.c) {
        if (argv.u) {
            var re = new RegExp(argv.u);
            var lineEmit = api.send_command(argv.c, function() {

            });
            lineEmit(function(line) {
                console.log(line);
                var match = re.exec(line);
                if (match) {
                    process.exit();
                }
            });
        } else {
            api.run_command_mode(argv.c);
        }
    } else {
        api.run_interactive_mode();
    }
});

