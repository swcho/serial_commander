
var serialport = require('serialport');

var sp;
var MARK_COMMAND_START = 'COMMAND_START';
var MARK_COMMAND_RESP = 'COMMAND_O:';
var MARK_COMMAND_RESP_ERROR = 'COMMAND_E:';
var MARK_COMMAND_END = 'COMMAND_END:';

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

function data_to_line_emit() {
    var backlog = '';
    var processLine;
    sp.on('data', function(data) {
        backlog += data;
        var n = backlog.indexOf('\n');
        while (~n) {
            if (processLine) {
                processLine(backlog.substring(0, n));
            }
            backlog = backlog.substring(n + 1);
            n = backlog.indexOf('\n');
        }
    });
    return function(handler) {
        processLine = handler;
    };
}

function run_command(command, resp_cb, err_resp_cb, finish_cb, debug) {
    var response_start = false;

    var data_handler = data_to_line(function(line) {
        if (debug) {
            console.log(line);
        }

        if (line.indexOf(MARK_COMMAND_START) == 0) {
            response_start = true;
        } else if (line.indexOf(MARK_COMMAND_END) == 0) {
            finish_cb(parseInt(line.replace(MARK_COMMAND_END, ''), 10));
            sp.removeListener('data', data_handler);
        } else if (response_start) {
            if (line.indexOf(MARK_COMMAND_RESP) == 0) {
                resp_cb(line.replace(MARK_COMMAND_RESP, ''));
            } else if (line.indexOf(MARK_COMMAND_RESP_ERROR) == 0) {
                err_resp_cb(line.replace(MARK_COMMAND_RESP_ERROR, ''));
            }
        }
    });

    sp.on('data', data_handler);

    // echo COMMAND_START; { { ll /storage/external_storage/sda1/test_cases 2>&3 | awk '{print "COMMAND_O:"$0}'; echo "COMMAND_FINISH:${PIPESTATUS[0]}" 1>&4 ; } 3>&1 1>&2 | awk '{print "COMMAND_E:"$0}'; } 4>&1 ;
    // ref: http://stackoverflow.com/questions/9112979/pipe-stdout-and-stderr-to-two-different-processes-in-shell-script
    // ref: http://unix.stackexchange.com/questions/14270/get-exit-status-of-process-thats-piped-to-another

    var wrapper = 'echo ' + MARK_COMMAND_START + '; ' +
        '{ { ' + command + ' 2>&3 | awk \'{print "' + MARK_COMMAND_RESP + '"$0}\'; echo "' + MARK_COMMAND_END + '${PIPESTATUS[0]}" 1>&4; } 3>&1 1>&2 | awk \'{print "' + MARK_COMMAND_RESP_ERROR + '"$0}\'; } 4>&1;' +
            //command + ' 2>&1 | awk \'{print "' + MARK_COMMAND_RESP + '"$0}\'; ' +
        '\n';

    if (debug) {
        console.log(wrapper);
    }

    sp.write(wrapper, function() {
    });
}

function run_command_mode(command) {
    console.log('Run Command: ', command);
    run_command(command,
        function(line) {
            console.log('OUT: ' + line);
        },
        function(line) {
            console.log('ERR: ' + line);
        }, function(exitCode) {
            console.log('EXIT: ' + exitCode);
            process.exit(exitCode);
        }
    );
}

function send_command(command, cb) {
    sp.write(command + '\n', cb);
    return data_to_line_emit();
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

function on_data(data_handler) {
    sp.on('data', function(data) {
        data_handler(data);
    });
}

function on_line(line_handler) {
    sp.on('data', data_to_line(line_handler));
}

exports.init = function(port, init) {
    sp = new serialport.SerialPort(port, {
        baudrate: 115200
    });
    sp.on('open', function() {
        var args = arguments;
        sp.flush(function() {
            //sp.on('data', function(data) {
            //    process.stdout.write(data);
            //});
            init.apply(this, args);
        });
    });
};

exports.run_command_mode = run_command_mode;
exports.run_interactive_mode = run_interactive_mode;
exports.run_command = run_command;
exports.send_command = send_command;
exports.on_data = on_data;
exports.on_line = on_line;