var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require("http");

var path = require('path');
var PORT = process.env.PORT || 8001;;

var host = "tvc4.forexpros.com"
var resData = [];
var resSearchData = [];


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/api/stockdata', getstockdata);

function getstockdata(req,res){
    resData = [];
    resSearchData = [];
    var symbol = req.query.symbol;
    var symbols = symbol.split('%');
    symbols.forEach(function(element) {   
        var searchpath = '/74b5368ec1066d04ad9d2cc10fd433ed/1511021910/1/1/8/search?limit=60&query='+ element +'&type=&exchange='
        var searchoptions = {
            "host": host,
            "path": searchpath
        };
        new HttpGetQuery(searchoptions,element,getSearchCallBack);            
    });
    function getSearchCallBack(data){            
        resSearchData.push(data);
        if (resSearchData.length == symbols.length){
            getDataWithQuery(symbols,res);
        }
    }
}       

function getDataWithQuery(symbolsin,res){
    var d = new Date();
    d.setDate(d.getDate() - 5);        
    var dateStart = Math.round(d.getTime() / 1000);
    var dateEnd = Math.round((new Date()).getTime() / 1000); 
    symbolsin.forEach(function(element) {
        var path = '/81957d16c038d3c488ca812fc635f26c/1510943380/1/1/8/history?symbol=' + element + '&resolution=' + '5' + '&from=' + dateStart + '&to=' + dateEnd            
        var options = {
            "host": host,
            "path": path
        };
        new HttpGet(options,element,getCallBack);
    });    
    function getCallBack(data){            
        resData.push(data);
        if (resData.length == symbolsin.length){
            res.status(200).json(resData);
        }
    }
}

function convertData(datain,symbol){
    var resArr = [];
    var data = parseJSONorNot(datain);
    var tmpValue = {            
        O : data.o[data.t.length - 1],
        H : data.h[data.t.length - 1],
        L : data.l[data.t.length - 1],
        C : data.c[data.t.length - 1],
        V : data.v[data.t.length - 1]
    };
    var resData = {
        symbol : symbol,        
        tickdata : tmpValue,
        description : checkQueryData(symbol)
    }
    return resData;
}
function checkQueryData(sym){
    for (var i = 0;i < resSearchData.length; i ++){
        var tmp = resSearchData[i];
        if(tmp.symbol == sym){
            return tmp.description;
        }
    }
    return '';
}
function getQeuryData(datain,symbol){
        var resArr = {};
        var data = parseJSONorNot(datain);
        data.forEach(function(row){
            if (row.symbol == symbol){
                if (row.exchange .toUpperCase().includes('NYSE')){
                    resArr = row;
                }else if(row.exchange.toUpperCase().includes('NASDAQ')){
                    resArr = row;
                }
            }
        });
        return resArr;
}
function HttpGet(options, symbol, callback) {
    function onDataCallback(response) {
        var result = '';
        response.on('data', function (chunk) {
            result += chunk;
        });
        response.on('end', function () {
            if (response.statusCode !== 200) {
                callback('');
                return;
            }
            callback(convertData(result,symbol));
        });
    }
    var req = http.request(options, onDataCallback);
    req.on('error', function (e) {
        callback('');
    });
    req.end();
}

function HttpGetQuery(options, symbol, callback) {
    function onDataCallback(response) {
        var result = '';
        response.on('data', function (chunk) {
            result += chunk;
        });
        response.on('end', function () {
            if (response.statusCode !== 200) {
                callback('');
                return;
            }
            callback(getQeuryData(result,symbol));
        });
    }
    var req = http.request(options, onDataCallback);
    req.on('error', function (e) {
        callback('');
    });
    req.end();
}
function parseJSONorNot(mayBeJSON) {
    if (typeof mayBeJSON === 'string') {
        return JSON.parse(mayBeJSON);
    } else {
        return mayBeJSON;
    }
}
app.listen(PORT, function () {
  console.log('Listening on port ' + PORT);
});
