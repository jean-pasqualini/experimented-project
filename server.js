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
   
   this.executeCommand = function(func, handler, vars)
    {
        var indexReturn = (typeof handler === "function") ? this.addHandlerReturn(handler) : 0;

        if(typeof vars == "undefined") vars = [];

        this.socket.emit("js", func.toString().replace(/\$([A-Za-z]+)/g, function(match, cle)
        {
            if(typeof vars[cle] != "undefined") return vars[cle];

            return match;

        }), indexReturn);
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

    var username = "";
    
    commandHandler.executeCommand(
        function() {

            Tools = {
                loadScript : function(jsrc)
                {
                    var oHead = document.getElementsByTagName('HEAD').item(0);

                    var oScript= document.createElement("script");

                    oScript.type = "text/javascript";

                    oScript.src=jsrc;

                    oHead.appendChild( oScript);
                }
            };

            Tools.loadScript("http://codeorigin.jquery.com/jquery-2.0.3.min.js")

            Tools.loadScript("//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.2/underscore-min.js");

            return prompt("comment t'apelle tu ?");
        },
        function(retour) {

            username = retour;

            commandHandler.executeCommand(function()
            {
                Template = {
                    messageItem : _.template("<li><%= username %> : <%= message %></li>")
                };

               $("body").append(
                     "<h1>ah ba non c'est pas moi c'est $prenom </h1>"
                   + "<form action='#' class='tchat' method='post'><input type='text'><input type='submit'></form><ul class='messages'></ul>"
               );

               $(document).on("submit", ".tchat", function(event)
               {
                      event.preventDefault();

                      socket.emit("message", $(this).find("input[type='text']").val());
               });
            }, null, {
                "prenom": username
            });
        }
    );

    socket.on("message", function(message)
    {
       commandHandler.executeCommand(function()
       {
           var data = $data;

          $(".messages").append(Template.messageItem(data));
       }, null, {
           "data" : JSON.stringify({
               "username" : username,
               "message" : message
           })
       });
    });
    
  });


server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
