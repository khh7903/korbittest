const express = require('express');
const app = express();
const port = 3000;
	
var csv = require("csvtojson");
// const csv = require('csv-parser')
const fs = require('fs')
const results = [];

var path = require('path');
var filePath = path.join(__dirname, "korbitKRW.csv");

var firstTimestamp = 0;
var lastTimestamp = 0;

app.get('/', (req, res, next) => {

    csv({
        noheader:true,
        output: "csv"
    })
    .fromFile(filePath)
    .then(function(jsonArrayObj){ //when parse finished, result will be emitted here.
        console.log(jsonArrayObj);
        
        var result = [];
        
        var i = 0;
        var finishTimestamp = parseInt(jsonArrayObj[jsonArrayObj.length - 1][0]);
        while(lastTimestamp < finishTimestamp) {
            

            if (i === 0) {
                firstTimestamp = parseInt(jsonArrayObj[i][0]);
            } else {
                firstTimestamp = lastTimestamp + 1;
            }
            console.log('type:'+ typeof(firstTimestamp));
            lastTimestamp = firstTimestamp + 29;

            var obj = {
                "start": firstTimestamp,
                "end": lastTimestamp,
                "open": "" + 0,
                "close": "" + 0,
                "high": "" + 0,
                "low": "" + 0,
                "average": "" + 0,
                "weighted_average": "" + 0,
                "volume": "" + 0
            }
            var arr = [];
            for (var j = i; j < jsonArrayObj.length; j++) {
                var timestamp = parseInt(jsonArrayObj[j][0]);

                if (lastTimestamp < timestamp) {
                    break;
                }

                if (firstTimestamp <= timestamp && timestamp <= lastTimestamp) {
                    arr.push(jsonArrayObj[i]);
                }
            }
            obj = getPeriodData(arr, obj);
            
            result.push(obj);

            i++;
        }
        
        console.log('result: ', JSON.stringify(result));

        res.send(result);
    })


    
});

function getPeriodData(arr, obj) {

    if (arr.length !== 0) {
        for (var c = 0; c < arr.length; arr++) {
            var price_ = parseInt(arr[c][1]);
            var sizes_ = parseFloat(arr[c][2]);
            var start = 0;
            var end = 0;
            var open = 0;
            var close = 0;
            var average = 0;
            var weighted_average = 0;
            var volume = 0;

            if (c == 0) {
                start = firstTimestamp;
                open = price_;
                high = price_;
                low = price_;
            }
            
            if (high < price_) {
                high = price_;
            }
            if (low > price_) {
                low = price_;
            }

            average += price_;
            weighted_average += price_;
            volume += sizes_;

            if (c == arr.length - 1) {
                end = lastTimestamp;
                close = price_;
                average = average / arr.length;
                weighted_average = weighted_average / arr.length;
            }

        }

        obj["open"] = ""+open;
        obj["close"] = ""+close;
        obj["high"] = ""+high;
        obj["low"] = ""+low;
        obj["average"] = ""+average;
        obj["weighted_average"] = ""+weighted_average;
        obj["volume"] = ""+volume;

    }

    return obj;
}

app.listen(port, () => {
    console.log(`Server is running at ${port}`);
});