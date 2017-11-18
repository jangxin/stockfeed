var express = require('express');
var http = require("http");
var symbolsDatabase = require("./symbol_database.js");
var router = express.Router();
var host = "demo_feed.tradingview.com";


router
    .route('/stockdata')
    .get(function (req, res) {        
        var resData = [];

        var resolution = req.query.resolution;
        var dateStart = req.query.from;
        var dateEnd = req.query.to; 
        var symbol = req.query.symbol;
        var symbols = symbol.split('%');
        symbols.forEach(function(element) {
            var path =  '/history?symbol=' + element + '&resolution=' + resolution + '&from=' + dateStart + '&to=' + dateEnd;
            var options = {
                "host": host,
                "path": path
            };
            new HttpGet(options,element,resolution,getCallBack);
        });       

        function getCallBack(data){            
            resData.push(data);
            if (resData.length == symbols.length){
                res.status(200).json(resData);
            }
        }
});
router
    .route('/stockmarket')
    .get(function (req, res) {
        var exchange  = req.query.exchange;
        var result = symbolsDatabase.getsymbolInfo(exchange);
        if (result != null){            
            res.status(200).json({data : result});
        }else{
            res.status(404).json({data :'invaild symbol'});
        }
});

function convertData(datain,symbol,resolution){
    var resArr = [];
    var data = parseJSONorNot(datain);
    for (var i = 0; i < data.t.length ; i ++)
    {
        var tmpValue = {
            T : data.t[i],
            O : data.o[i],
            H : data.h[i],
            L : data.l[i],
            C : data.c[i],
            V : data.v[i]
        };
        resArr.push(tmpValue);
        
    }
    var resData = {
        symbol : symbol,
        resolution : resolution,
        tickdata : resArr
    }
    return resData;
}
function HttpGet(options, symbol, resolution, callback) {
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
			callback(convertData(result,symbol,resolution));
		});
	}
    var req = http.request(options, onDataCallback);
	req.on('socket', function (socket) {
		socket.setTimeout(5000);
		socket.on('timeout', function () {
				req.abort();
		});
	});

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
module.exports = router;
