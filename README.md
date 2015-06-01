# serial_commander

Simple serial communication utility for sending command and receive response.

Can be utilized in embedded device development which has serial port for debugging and busybox.

## Install

```shell
$ git clone https://github.com/swcho/serial_commander.git; cd serial_commander; npm install
```

## Usages in shell command

Send "ll" command for listing files through "/dev/ttyS0" port and print response and finish
```shell
sudo ./serial_commander.js --port /dev/ttyS0 -c "ll"
```

## Usages programatically

```node
#!/usr/bin/node

var api = require('./index.js');
api.init('/dev/ttyS0', function() {
    api.run_command('ll', function(line) {
        console.log(line);
    });
});
```