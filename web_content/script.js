// Server -> Client
const CART_DRIVING = 'CART_DRIVING';
const DONE = 'DONE';
const MESSAGE = 'MESSAGE';
const AUTH_STATUS = 'AUTH_STATUS';
const NEW_LOGIN = 'NEW_LOGIN';

// Client -> Server
const AUTH = 'AUTH';
const GOTO = 'GOTO';
const BREAK = 'BREAK';
const CONTINUE = 'CONTINUE';

//

window.getCookie = function(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
}

//

var socket;

$(()=>{
    $('#loading-status').html('Verbinden...')
    socket = initSocket();
});

//

function initSocket(reconnect = false){
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    var socketUrl = window.location.host;
    var connection = new WebSocket(`ws://${socketUrl}`);

    connection.onopen = function () {
        $('#loading-status').html('Authentifizieren...');
        connection.send(AUTH + '=' + window.getCookie('auth'));
    };

    connection.onerror = function (error) {
        if(!reconnect) reconnectSocket();
        return null;
    };

    connection.onmessage = function (message) {
        var mes = message.data;
        var data = '';
        if(mes.includes('=')) {
            mes = mes.split('=')[0];
            data = message.data.substring(mes.length + 1);
        }
        switch(mes){
            case CART_DRIVING:
                if(data == 'true') cContinue(false);
                else cBreak(false);
                break;

            case DONE:
                window.location = './done';
                break;

            case MESSAGE:
                alert(data);
                break;

            case AUTH_STATUS:
                if(data == 'success'){
                    $('#loading-status').html('Authentifiziert!');
                    $('#content').addClass('show');
                } else {
                    $('#loading-status').html('Authentifizierung fehlgeschlagen!');
                }
                break;  

            case NEW_LOGIN:
                window.location = './newlogin';
                break;
        }
    };

    return connection;
}

function reconnectSocket(){
    $('#content').removeClass('show');
    $('#loading-status').html('Reconnecting...');
    socket = initSocket(true);
    if(socket == undefined || socket == null){
        $('#content').removeClass('show');
        $('#loading-status').html('Reconnecting...');
    }
}

//

var cartDriving = false;

function stop(){
    if(socket == undefined) return;

    if(cartDriving) cBreak();
    else cContinue();
}

function cBreak(send = true){
    if(send) socket.send(BREAK);
    $('#break').addClass('continue');
    $('#break').html('Weiter');
    cartDriving = false;
}

function cContinue(send = true){
    if(send) socket.send(CONTINUE);
    $('#break').removeClass('continue');
    $('#break').html('Stop');
    cartDriving = true;
}