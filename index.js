var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var path = require('path');
var PORT = process.env.PORT || 8001;;
var router = require('./route/route.js');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use('/api', router);
app.listen(PORT, function () {
  console.log('Listening on port ' + PORT);
});
