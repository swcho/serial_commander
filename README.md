# serial_commander

Simple serial communication utility for sending command and receiving response.

Can be utilized some kind of automation in embedded device development which has serial port for debugging and busybox.

Main idea is to append string prefix for command's response as described in next link.

http://serverfault.com/questions/72744/command-to-prepend-string-to-each-line


## Install

```shell
$ git clone https://github.com/swcho/serial_commander.git; cd serial_commander; npm install
```

## Usages in shell command

Below example shows sending "ll" command for listing files through "/dev/ttyS0" port and print response and finish.

```
$ sudo ./serial_commander.js --port /dev/ttyS0 -c "ll"
drwxr-xr-x root     root              1970-06-09 17:31 acct
drwxr-xr-x root     root              1970-01-01 08:00 backup
drwxr-xr-x root     root              1970-01-01 08:00 boot
drwxrwx--- system   cache             1970-06-09 18:42 cache
dr-x------ root     root              1970-06-09 17:31 config
lrwxrwxrwx root     root              1970-06-09 17:31 d -> /sys/kernel/debug
drwxrwx--x system   system            2015-04-07 14:00 data
-rw-r--r-- root     root          120 1970-01-01 08:00 default.prop
drwxr-xr-x root     root              1970-06-09 17:31 dev
lrwxrwxrwx root     root              1970-06-09 17:31 etc -> /system/etc
-rw-r--r-- root     root         9527 1970-01-01 08:00 file_contexts
-rwxr-x--- root     root       467692 1970-01-01 08:00 init
-rwxr-x--- root     root          663 1970-01-01 08:00 init.connectivity.rc
-rwxr-x--- root     root          919 1970-01-01 08:00 init.environ.rc
-rwxr-x--- root     root        19861 1970-01-01 08:00 init.rc
-rwxr-x--- root     root         1795 1970-01-01 08:00 init.trace.rc
-rwxr-x--- root     root         3915 1970-01-01 08:00 init.usb.rc
drwxrwxr-x root     system            1970-06-09 17:31 mnt
dr-xr-xr-x root     root              1970-01-01 08:00 proc
-rw-r--r-- root     root         2161 1970-01-01 08:00 property_contexts
drwx------ root     root              2015-04-02 14:29 root
drwxr-x--- root     root              1970-01-01 08:00 sbin
lrwxrwxrwx root     root              1970-06-09 17:31 sdcard -> /storage/emulated/legacy
-rw-r--r-- root     root          656 1970-01-01 08:00 seapp_contexts
-rw-r--r-- root     root        75478 1970-01-01 08:00 sepolicy
drwxr-x--x root     sdcard_r          1970-06-09 17:31 storage
drwx------ root     root              1970-06-09 17:32 swap_zram0
dr-xr-xr-x root     root              1970-06-09 17:31 sys
drwxr-xr-x root     root              1970-01-01 08:00 system
-rw-r--r-- root     root         4086 1970-01-01 08:00 ueventd.rc
lrwxrwxrwx root     root              1970-06-09 17:31 vendor -> /system/vendor
$ 
```

But, you can use serial_commander as serial console if -c option is not provided as below

```
$ sudo ./serial_commander.js --port /dev/ttyS0
[interactive mode...]
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