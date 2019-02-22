const valid_tokens = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'.split('');
const token_length = 16;

exports.make = () => {
    var out = "";
    for(var i = 0; i < token_length; i++)
        out += randChar();
    return out;
}

var randChar = () => valid_tokens[Math.floor(Math.random() * valid_tokens.length)];