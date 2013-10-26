//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');

var async = require('async');
var socketio = require('socket.io');
var fs = require("fs");

//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var server = http.createServer();

server.on("request", function(req, res) {
  res.writeHead(200);
  fs.readFile('./client/index.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
});

var io = socketio.listen(server);

var CommandHandler = function(socket)
{
   this.handlerReturn = [];
   
   this.socket = socket;
   
   this.addHandlerReturn = function(handler)
   {
       var index = this.handlerReturn.length + 1;
       
       this.handlerReturn[index] = handler;
       
       return index;
   }
   
   this.executeCommand = function(func, handler)
    {
        var indexReturn = (typeof handler !== "undefined") ? this.addHandlerReturn(handler) : 0;
        
        this.socket.emit("js", func.toString(), indexReturn);
    };
    
    this.onReturn = function(parameters)
    {
       if(typeof this.handlerReturn[parameters.id] == undefined) console.log("wrong return");
       
       this.handlerReturn[parameters.id](parameters.data);
    };
    
    var instance = this;
   
   this.socket.on("js.return", function(parameters)
   {
       instance.onReturn(parameters);
   });
};



io.on('connection', function (socket) {
    
    var commandHandler = new CommandHandler(socket);
    
    commandHandler.executeCommand(
        function() { 
            
            var oHead = document.getElementsByTagName('HEAD').item(0);

            var oScript= document.createElement("script");
            
            oScript.type = "text/javascript";
            
            oScript.src="http://codeorigin.jquery.com/jquery-2.0.3.min.js";
            
            oHead.appendChild( oScript);
            
            return prompt("comment t'apelle tu ?");
        },
        function(retour) { 
            commandHandler.executeCommand(function()
            {
               alert("merci chef"); 
            });
        }
    );
    
  });


server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
