stouty
===========================
remote stdout relayer

instructions:
 1. install: npm install stouty
 2. requie('stouty') in your module.
 3. call listen on stouty object with whatever port you want to listen on.
 4. use telnet to get streamed data to your console

// example

var stouty = require('stouty');

if(process.env.NODE_ENV == 'development') {
   stouty.listen(63730);
}


// usage

telnet serverbox0192 63730

