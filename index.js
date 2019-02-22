var http = require('http');
var fs = require('fs');
var mime = require('mime-types');

var WebSocketServer = require('websocket').server;

var config = require('./config.json');


//

createWebServer(config.server_port, config.pages_path);
createSocketServer(config.socket_port);


/** Creates and starts the web server */
function createWebServer(port, pages_path){
    return http.createServer((req, res)=>{
        var url = req.url;
        if(!url.includes('.')) url += '/index.html';
    
        var path = `${pages}${url}`;
        if(!fs.existsSync(path)) path = `${pages}/404.html`;
        var content = fs.readFileSync(path, 'utf8');
        
        var type = mime.lookup(path);
    
        res.writeHead(200, {'Content-Type': type});
        res.end(content);
    }).listen(port);
}

/** Creates and starts the websocket server */
function createSocketServer(port){

}