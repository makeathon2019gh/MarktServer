// Client -> Server
const CART_DRIVING = 'CART_DRIVING';
const DONE = 'DONE';
const MESSAGE = 'MESSAGE';

// Server -> Client
const GOTO = 'GOTO';
const BREAK = 'BREAK';
const CONTINUE = 'CONTINUE';



var socket;

$(()=>{
    $('#loading-status').html('Verbinden...')
    socket = initSocket();
});

function initSocket(reconnect = false){
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    var socketUrl = window.location.host;
    var connection = new WebSocket(`ws://${socketUrl}`);

    connection.onopen = function () {
        setTimeout(()=>$('#loading-status').html('Verbunden!'), 100);
        setTimeout(()=>$('#content').addClass('show'), 300);
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

                break;
            case MESSAGE:
                alert(data);
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