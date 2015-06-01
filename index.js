
var argv = require('optimist')
    .alias('c', 'command')
    .argv;

var serialport = require("serialport");
var sp = new serialport.SerialPort("/dev/ttyS0", {
    baudrate: 115200
});

var MARK_COMMAND_START = 'COMMAND_START';
var MARK_COMMAND_END = 'COMMAND_END';

function data_to_line(processLine) {
    var backlog = '';
    return function(data) {
        backlog += data;
        var n = backlog.indexOf('\n');
        while (~n) {
            processLine(backlog.substring(0, n));
            backlog = backlog.substring(n + 1);
            n = backlog.indexOf('\n');
        }
    };
}

function run_command(command) {
    console.log('Run Command: ', command);

    var response_start = false;

    sp.on('data', data_to_line(function(line) {
        var trimmed = line.trim();
        if (trimmed == MARK_COMMAND_START) {
            response_start = true;
        } else if (trimmed == MARK_COMMAND_END) {
            process.exit();
        } else if (response_start) {
            console.log(trimmed);
        }
    }));

    sp.write('echo ' + MARK_COMMAND_START + '; ' + command + '; echo ' + MARK_COMMAND_END + '; \n', function() {

    });
}

function run_interactive_mode() {
    sp.on('data', function(data) {
        process.stdout.write(data);
    });

    process.stdin.setRawMode(true);
    var stdin = process.openStdin();
    stdin.on('data', function(data) {

        if (data.length === 1 && data[0] == 0x03) {
            process.exit();
        }

        sp.write(data, function() {

        });
    });
}

sp.on('open', function() {

    if (argv.c) {
        run_command(argv.c);
    } else {
        run_interactive_mode()
    }

});

