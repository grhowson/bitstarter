var express = require('express');
var app = express();
app.use(express.logger());

var fs = require('fs');
var fbuf = fs.readFileSync('index.html');
var fstr = fbuf.toString();


app.get('/', function(request, response) {
  response.send(fstr);
});

var port = process.env.PORT || 8080;
//var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
