exports.parseCookies = req => {
    var list = {};
    var rc = req.headers.cookie;

    rc && rc.split(';').forEach(cookie => {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}

exports.redirect = (res, url) => {
    res.writeHead(302, { 'Location': url });
    res.end();
}