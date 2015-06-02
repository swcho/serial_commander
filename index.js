
var serialport = require('serialport');

var sp;
var MARK_COMMAND_START = 'COMMAND_START';
var MARK_COMMAND_RESP = 'COMMAND_RESP:';
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

function run_command(command, resp_cb, finish_cb) {
    var response_start = false;

    sp.on('data', data_to_line(function(line) {
        //var trimmed = line.trim();
        if (line.indexOf(MARK_COMMAND_START) == 0) {
            response_start = true;
        } else if (line.indexOf(MARK_COMMAND_END) == 0) {
            finish_cb();
        } else if (response_start) {
            if (line.indexOf(MARK_COMMAND_RESP) == 0) {
                resp_cb(line.replace(MARK_COMMAND_RESP, ''));
            }
        }
    }));

    sp.write('echo ' + MARK_COMMAND_START + '; ' + command + ' | awk \'{print "' + MARK_COMMAND_RESP + '"$0}\'; echo ' + MARK_COMMAND_END + '; \n', function() {

    });
}

function run_command_mode(command) {
    console.log('Run Command: ', command);
    run_command(command, function(line) {
        console.log(line);
    }, function() {
        process.exit();
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

exports.init = function(port, init) {
    sp = new serialport.SerialPort(port, {
        baudrate: 115200
    });
    sp.on('open', init);
};

exports.run_command_mode = run_command_mode;
exports.run_interactive_mode = run_interactive_mode;
exports.run_command = run_command;