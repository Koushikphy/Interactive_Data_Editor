var http = require('http');

function buildAuthHeader(user, pass) {
    return 'Basic ' + new Buffer.from(user + ':' + pass).toString('base64');
}

proxy = 'proxy.iacs.res.in';
proxy_port = 3128;
host = 'api.github.com';
url = 'http://api.github.com/repos/Koushikphy/Interactive-Data-Editor/tags';
user = 'koushik%20naskar';
pass = 'knaskar';

var options = {
    port: proxy_port,
    host: proxy,
    path: url,
    headers: {
        Host: host,
       'Proxy-Authorization': buildAuthHeader(user, pass),
    }
};

http.get(options, function(res) {
  console.log("StatusCode: " + res.statusCode + " Message: " + res.statusMessage);
});