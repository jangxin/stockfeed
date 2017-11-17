var express = require('express');
var http = require("http");
var symbolsDatabase = require("./symbol_database.js");
var router = express.Router();
router
    .route('/stockdata')
    .get(function (req, res) {
        var symbol = req.query.symbol;
        var resolution = req.query.resolution;
        var dateStart = req.query.from;
        var dateEnd = req.query.to;
        // var result = symbolsDatabase.symbolInfo(symbol);
        
            var path =  '/history?symbol=' + symbol + '&resolution=' + resolution + '&from=' + dateStart + '&to=' + dateEnd;
            var options = {
              "host": "demo_feed.tradingview.com",
              "path": path
            };  
            var requip = http.request(options, function (result) {
              var chunks = [];  
              result.on("data", function (chunk) {
                chunks.push(chunk);
              });  
              result.on("end", function () {
                var body = Buffer.concat(chunks);
                var resultdata = JSON.parse(body.toString());
                res.status(200).json({'status':true,'symbol' : symbol,'resolution' : resolution  ,'data': convertData(resultdata)});
              });
            });            
            requip.on('error', function (e) {                  
                  res.status(400).json({'status':false,'data':e});
            });
            requip.end();
        // }else{
        //     res.status(404).json({data :'invaild symbol'});
        // }
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

function convertData(data){
    var resArr = [];
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
    return resArr;
}

module.exports = router;
