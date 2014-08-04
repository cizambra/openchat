openchat
========

An open source chat application made using just node-webkit, HTML5, JS and CSS

# Client

Right now the client allows to easily join as an anonymous user from a desktop web-app. If you want to create your custom websocket server chat, you have to change the websocket IP (or URL) from where request will be made. This can be done (by now) at line 7 on app.js file.

The client is made using angularJS so, you can upload this client as a web service or just re-build as a desktop web-app using node-webkit and gruntjs.

You can compile the desktop app using this tutorial:
http://techcat.brainfull.net/2014/04/03/programando-con-node-webkit-2-build/

# Server

The client needs a source from where requests can be dispatched. This version of websocket server is basic,  so you can improve and custom in the way you wish. The server was made using nodeJS. If you want to keep the server running as a daemon, I suggest you to use **forever** package (https://www.npmjs.org/package/forever).

This app is under MIT license.

