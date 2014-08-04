// http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
"use strict";

var app = require('http').createServer(function(){});
var io = require('socket.io');
var _ = require("underscore");
var uuid = require('node-uuid');

app.listen(1337);

var ws = io.listen(app);

/* User list */
var users = {};

ws.on('connection', function (socket) {
  console.log("New socket connected");
  var token;  // An unique secure key
  var tokens; // List of current unique secure keys
  var token_exists; // Does the generated token exists in the list of uuids?

  do {
    /* An unique secure key is created */
    token = uuid.v1();
    /* It is verified that the token is unique */
    tokens = Object.keys(users);
    token_exists = (_.indexOf(tokens, token) > -1) ? true : false;
  } while (token_exists);

  socket.on('comment.received', function (data) {
    console.log(data);
    ws.sockets.emit('comment.send', data);
  });
  socket.on('user.new', function(data){
    var raw_user_list = _.map(users, function(user, key){ return user ; });
    var matches = _.where(raw_user_list, {name:data.name});
    console.log(matches); 
    if (matches.length > 0) {
        socket.emit('user.status', { status: "rejected" });
        console.log("Usuario ya existe");
    } else {
        users[token] = data;
        console.log(users);
        socket.emit('user.status', { status: "connected" , connection_token: token});
    }
  });
  socket.on('user.connected',function(data){
    /* When an user connects, the list is refreshed for 
     * all the users. */
    ws.sockets.emit('user.list', users);
  });

  socket.on('disconnect', function() {
      console.log('Usuario se ha desconectado');
      delete users[token];
      ws.sockets.emit('user.list', users);
   });
});
