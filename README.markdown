stouty
===========================
remote stdout relayer


// usage: insert require('stouty').listen(PORT); into your app
if(process.env.NODE_ENV == 'development') {
	require('stouty').listen(63730);
}

// then, use telnet to watch the messages;
telnet serverbox0192 63730

