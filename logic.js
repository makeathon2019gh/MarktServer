const index = require('./index')

// Client -> Server
const LOGIN = 'LOGIN';
const DEST_REACHED = 'DEST_REACHED';
const LOG = 'LOG';
const STOP = 'STOP';

// Server -> Client
const TOKEN = 'TOKEN';
const GOTO = 'GOTO';
const BREAK = 'BREAK';
const CONTINUE = 'CONTINUE';

// Server -> User
const CART_DRIVING = 'CART_DRIVING';
const DONE = 'DONE';
const MESSAGE = 'MESSAGE';
const AUTH_STATUS = 'AUTH_STATUS';
const NEW_LOGIN = 'NEW_LOGIN';

// User -> Server
//const GOTO = 'GOTO';
//const BREAK = 'BREAK';
//const CONTINUE = 'CONTINUE';
const AUTH = 'AUTH';


/** Handles incoming websocket messages */
exports.onWebsocketMessage = (message, connection) => {
    var cmd = message;
    var data = '';
    if(cmd.includes('=')) {
        cmd = cmd.split('=')[0];
        data = message.substring(cmd.length + 1);
    }

    switch(cmd){
        // From carts

        case LOGIN:
            for (var c of index.carts) {
                if (c.clientsecret == data)
                    c.socketconnection = connection;
            }
            break;

        case DEST_REACHED:
            //TODO
        case STOP:
            var cart = getCartByConnection(connection);
            if(cart == null) return;
            if(cart.userconnection == null) return;
            cart.userconnection.send(CART_DRIVING + '=false');
            break;

        case LOG:
            var cart = getCartByConnection(connection);
            if(cart == null) return;
            if(cart.userconnection == null) return;
            cart.userconnection.send(MESSAGE + '=' + data);
            break;

        // From users

        case AUTH:
            var success = false;
            for (var c of index.carts) {
                if (c.authtoken == data) {
                    if(c.userconnection != null) c.userconnection.send(NEW_LOGIN);
                    c.userconnection = connection;
                    connection.send(AUTH_STATUS + '=success');
                    success = true;
                }
            }
            if(!success) connection.send(AUTH_STATUS + '=failed');
            break;

        case BREAK:
            var cart = getCartByConnection(connection);
            if (cart == null) return;
            if (cart.socketconnection == null) return;
            cart.socketconnection.send(BREAK);
            break;

        case CONTINUE:
            var cart = getCartByConnection(connection);
            if(cart == null) return;
            if(cart.socketconnection == null) return;
            cart.socketconnection.send(CONTINUE);
            break;

        case GOTO:
            //TODO
            break;
    }
}

/** Handles user disconnecting */
exports.onWebsocketUserConnect = (connection) => {
    console.log('Client connected');
}

/** Handles user disconnecting */
exports.onWebsocketUserDisconnect = (connection) => {
    console.log('Client disconnected');
}

function getCartByConnection(connection) {
    for(var c of index.carts)
        if(c.socketconnection == connection) return c;
    return null;
}

function getCartByUser(connection) {
    for(var c of index.carts)
        if(c.userconnection == connection) return c;
    return null;
}