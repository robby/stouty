var net = require('net'), server, sockets = [];

module.exports.listen = function init (port) {
  // setup listener
  server = net.createServer(function(socket){
    sockets.push(socket);
    socket.once('end', function(){
      sockets.splice(sockets.indexOf(socket), 1);
      console.log('stouty client disconnected');
    });
    console.log('stouty client connected');

    socket.write('stouty ready\n');
  });

  server.listen(port || 8000);

  stouty(handleStout);
}

function handleStout (message) {
  for (var i = sockets.length - 1; i >= 0; i--) {
    if(!sockets[i] || sockets[i].destroyed) {
      sockets.splice(i, 1);
      continue;
    }
    sockets[i].write(message);
  };
}


function stouty(callback) {
  var addWriteStub = function(original) {
    var _write = original.write;
    return function(string, encoding, fd) {
      _write.call(original, string, encoding, fd);
      callback(string, encoding, fd);
    };
  };

  process.stdout.write = addWriteStub(process.stdout);
  process.stderr.write = addWriteStub(process.stderr);
};