const valid_tokens = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'.split('');
const token_length = 16;

exports.make = () => {
    return "A83HnDji821j43Ne"; // TODO REMOVE; Using a static token because the RFID chip does not work
    var out = "";
    for(var i = 0; i < token_length; i++)
        out += randChar();
    return out;
}

var randChar = () => valid_tokens[Math.floor(Math.random() * valid_tokens.length)];