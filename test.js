#!/usr/bin/node

var api = require('./index.js');
api.init('/dev/ttyUSB0', function() {
    //api.run_command('ll',
    //    function(line) {
    //        console.log(line);
    //    }, function() {
    //
    //    }, function() {
    //
    //    },
    //    true
    //);
    var lineEmit = api.send_command('reboot', function() {

    });

    lineEmit(function(line) {
        console.log(line);
    });
});

