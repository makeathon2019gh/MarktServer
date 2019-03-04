const http = require('http');
const fs = require('fs');
const mime = require('mime-types');
const url = require('url');
const readline = require('readline');

var WebSocketServer = require('websocket').server;

var httpUtils = require('./httpUtils');
var tokengen = require('./tokengen');
var logic = require('./logic');
var config = require('./config.json');
var cartlist = require('./cartlist.json');



/* All carts with their UUID as key and a object containing their properties.
 * Said object contains:
 * - client secret
 * - auth token
 * - socket connection
 * - some functions {see initCarts()}
 */
var carts = [];
exports.carts = carts;



initCarts();
console.log(cartlist.length > 1 ? `${cartlist.length} carts loaded.` : `${cartlist.length} cart loaded.`);

var httpServer = initWebServer(config.port, config.pagespath);
console.log(`Server running on port ${config.port}`);

var webSocket = initWebSocket(httpServer);
console.log(`Websocket started`);

initReadline();

// TODO REMOVE; test only
console.log("http://localhost:8080/?token=" + carts["testWagen"].ready())



/** Initialises the carts */
function initCarts(){
    for(var c of cartlist){
        carts[c.name] = {
            clientsecret: c.secret,
            authtoken: '',
            socketconnection: null,
            userconnection: null,
            newToken: function() { // Assigns this cart a new auth token, kicking out all connected devices
                this.authtoken = tokengen.make();
                this.syncToken();
                return this.authtoken;
            },
            clearToken: function() { // Clears this carts token, makeing it impossible to connect to it
                this.authtoken = '';
                this.syncToken();
                return this.authtoken;
            },
            syncToken: function() { // Sends the server sided token to the client (if client is connected yet)
                this.socketconnection && this.socketconnection.sendUTF('NEW TOKEN ' + this.authtoken);
            },
            checkout: function() { // Is called as the cart reaches the checkout, kicking the user out and setting the cart to autopilot
                return this.clearToken();
            },
            ready: function() { // Gets triggert when the cart reaches its autopilot destination and is ready to be used
                return this.newToken();
            }
        };
    }
}

/** Creates and starts the web server */
function initWebServer(port, pagespath) {
    return http.createServer((req, res) => {
        // Parsing the url
        var uri = url.parse(req.url, true);
        var reqpath = uri.pathname;
        
        // Redirecting to index.html if no specific file is requested
        if (!reqpath.includes('.'))
            reqpath += (reqpath.endsWith('/') ? '' : '/') + 'index.html';

        // User recognition
        var operating = null;
        var cookies = httpUtils.parseCookies(req);
        if(cookies.auth) {
            for(var c in carts) {
                if(carts[c].authtoken == cookies.auth)
                    operating = carts[c];
            }
        }

        // Do token handling
        var cookiesout = '';
        if(reqpath == '/index.html'){
            if(uri.query.token !== undefined){
                cookiesout += `auth=${uri.query.token};`

                for(var c in carts) {
                    if(carts[c].authtoken == uri.query.token) 
                        operating = carts[c];
                }
            }
        }

        // Redirects if a not authenticated user tries to use auth-only pages
        if(!operating && !(reqpath.includes('/noauth') || reqpath.includes('/done'))) httpUtils.redirect(res, '/noauth');
    
        // Reading the requested file or - if it doesnot exist - 404.html
        var path = pagespath + reqpath;
        if (!fs.existsSync(path))
            path = `${pagespath}/404.html`;
        var content = fs.readFileSync(path, 'utf8');
        
        // Send out response
        var type = mime.lookup(path);
        res.writeHead(200, {
            'Set-Cookie': cookiesout,
            'Content-Type': type
        });
        res.end(content);
    }).listen(port);
}

/** Creates and starts the websocket server */
function initWebSocket(server) {
    var webSocket = new WebSocketServer({
        httpServer: server
    });

    webSocket.on('request', req => {
        var connection = req.accept(null, req.origin);

        logic.onWebsocketUserConnect(connection);

        connection.on('message', message => {
            if (message.type !== 'utf8') return;
            logic.onWebsocketMessage(message.utf8Data, connection);
        });

        connection.on('close', connection => {
            logic.onWebsocketUserDisconnect(connection);
        });
    });

    return webSocket;
}

/** Initialates readline in order to listen to console input */
function initReadline(){
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.on('line', (input) => {
        try{
            if (input.startsWith('c')) { // Message to cart
                var name = input.split(' ')[1];
                var c = carts[name];
                if(c.socketconnection == null) return;
                c.socketconnection.send(input.substring(3 + c.name.length));
            } else if (input.startsWith('u')) { // Message to user
                var name = input.split(' ')[1];
                var c = carts[name];
                if(c.userconnection == null) return;
                c.userconnection.send(input.substring(3 + c.name.length));
            } else {
                console.log('Invalid syntax. Use <c/u> <cartname> <message>');
            }
        } catch (e) {
            console.log("An error occured whilst processing your input!");
        }
    });
}