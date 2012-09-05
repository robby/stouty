var net = require('net'), cluster = require('cluster'), os = require('os'), hostname = os.hostname(), server, sockets = [];

module.exports.listen = function init (port) {
	// setup listener
	server = net.createServer(function(socket){
		var ip = socket.remoteAddress;

		sockets.push(socket);
		socket.once('end', function(){
			sockets.splice(sockets.indexOf(socket), 1);
			console.log('stouty client ' + ip + ' disconnected');
		});
		socket.on('data', function(message){
			var level = message.toString().trim();
			if(!level) return;

			socket.level = level == 'e' ? 'error' : level == 'i' ? 'info' : 'all';

			socket.write('level: ' + socket.level + '\r\n');
		});
		console.log('stouty client ' + ip + ' connected');

		socket.write('stouty ready: ' + os.hostname() + '\r\n');
	});

	server.listen(port || 8000);
}

stouty(handleStout);

module.exports.write = handleStout;

function handleStout(message, level) {
	// if cluster worker relay message to master
	if(cluster.isWorker) {
		return process.send(message);
	}

	for (var i = sockets.length - 1; i >= 0; i--) {
		if(!sockets[i] || sockets[i].destroyed) {
			sockets.splice(i, 1);
			continue;
		}

		if(sockets[0].level != 'all' && sockets[0].level != level) continue;

		sockets[i].write(message);
	};
}

function stouty(callback) {
	var addWriteStub = function(original, level) {
		var _write = original.write;
		return function(string, encoding, fd) {
			_write.call(original, string, encoding, fd);
			callback(string, level);
		};
	};

	process.stdout.write = addWriteStub(process.stdout, 'info');
	process.stderr.write = addWriteStub(process.stderr, 'error');
};

cluster.on('fork', function(worker){
	worker.on('message', function(msg){
		handleStout(hostname + ' - ' + msg);
	});
});