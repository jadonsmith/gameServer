/*
var fs = require('fs');

var privateKey = fs.readFileSync('certs/privkey.pem', 'utf8');
var certificate = fs.readFileSync('certs/fullchain.pem', 'utf8');

var credentials = { key: privateKey, cert: certificate };
var https = require('https');

var httpsServer = https.createServer(credentials);

fs.readFile('web_client/index.html', function (err, html) {
    if (err) {
        throw err; 
    }       
    https.createServer(function(request, response) {  
        response.writeHeader(200, {"Content-Type": "text/html"});  
        response.write(html);  
        response.end();  
    }).listen(8080);
});

var httpsServerWS = https.createServer(credentials);
httpsServerWS.listen(8443);

// require the ws package (after npm install ws) docs: https://www.npmjs.com/package/ws
const WebSocket = require('ws');

var WebSocketServer = WebSocket.Server;
var wss = new WebSocketServer({
	server: httpsServerWS,
	clientTracking: true,
});
*/

// require the ws package (after npm install ws) docs: https://www.npmjs.com/package/ws
const WebSocket = require('ws'); 

// define a web socket server named "wss" on a specified port 
const port = 8010;
const wss = new WebSocket.Server({
    port: port,
    // turn on clientTracking to allow wss to use client data like headers, cookies, ip address
    clientTracking : true
});

console.log("Web Socket server listening");

// require the State class defined in js/gameClient/serverState.js
const State = require('./serverState');
// require the User class defined in js/gameClient/serverUser.js
const User = require('./serverUser');

// define a State named "gameState"
let gameState = new State();

function update(){
    // update the game state every tick
    gameState.update();
    // send the state to all clients every tick
    wss.clients.forEach(function each(client) { 
        if (client.readyState === WebSocket.OPEN) {
            let state = JSON.stringify(gameState.getCurrentState());
            client.send(JSON.stringify({
                type:"serverState",
                state: state
            }));
        }
    });
}


// define how many times the server updates per second (ticks per 1000ms)
// 30 is plenty for most cases, 60-128 for more "real-time" feel
const tickRate = 60; 
setInterval(function(){ 
    if(gameState.readyState == true){
        update();
    }
},1000 / tickRate); 

console.log("Game loop started: " + gameState.getStartTime());

// when a client joins, let the other clients know
function userJoined(name){
    update();
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type : "userJoined",
                userName : name
            }));
        }
    });
}

// when a client leaves, let the other clients know
function userLeft(name){
    update();
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type : "userLeft",
                userName : name
            }));
        }
    });
}


// once a user connects
wss.on("connection", function connection(ws,request) {
    // define new User object with access to "request" which contains the client's HTTP GET request (headers, cookies, IP address, etc)
    let user = new User(request); 

    // define function to "compress" objects to JSON, which is a string, reducing network load
    function sendMessage(message){
        let msg = JSON.stringify(message);
        ws.send(msg);
    }

    gameState.setReady(true);
    
    console.log("[" + user.getId() + "] connected");

    // when the server receives a message from the client
    ws.on('message', function incoming(message) {
        let msg = JSON.parse(message); // convert the JSON string back into an object

        // require the user to select a valid username before considering them "ready"
        if(user.ready == false){ 
            if(msg.type == "userReady"){ // user says they're ready
                // use regex to check the string for "illegal" characters
                let re = /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/;
                if(re.test(msg.clientName) == false){
                    sendMessage({
                        type:"notReady",
                        reason:"illegal characters"
                    });
                // if it passes the regex, then make sure it's not too long
                }else if(msg.clientName.length > 12){
                    sendMessage({
                        type:"notReady",
                        reason:"too many characters"
                    });
                // once the username is accepted
                }else{
                    user.setName(msg.clientName);
                    console.log("[" + user.getId() + "] selected name: " + user.getName());

                    // add the user to the game state
                    gameState.addUser(user);
                    
                    // tell the other clients who joined
                    userJoined(user.getName());

                    // set the user to ready and inform them
                    user.setReady(true);
                    sendMessage({
                        type:"userReady",
                        userReady:true
                    });

                    console.log("[" + user.getId() + "] ready as " + user.getName());
                }   
            }
        // if the user is ready
        }else{
            // parse messages received from the user
            switch(msg.type){
                case "mouseMove":
                    user.mouseMove(msg.x, msg.y);
                    break;
                case "mouseDown":
                    user.mouseDown(msg.x,msg.y);
                    break;
                case "mouseUp":
                    user.mouseUp(msg.x,msg.y);
                    break; 
                case "keyDown":
                    user.keyDown(msg.key);
                    break;
                case "keyUp":
                    user.keyUp(msg.key);
                    break;
                case "mouseLeave":
                    user.mouseLeave();
                    break;
                case "canvasFocusIn":
                    user.canvasFocusIn();
                    break;
                case "canvasFocusOut":
                    user.canvasFocusOut();
                    break;
            }
        }
    });

    ws.on('close', function close() {
        // remove the user from the game state
        gameState.deleteUser(user.id);
        // tell the other clients who left
        if(user.ready){
            userLeft(user.getName());
        }

        console.log("[" + user.id + "] ("+user.getName()+") disconnected");
    });
});
