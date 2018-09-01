import { isNumber } from "util";

var parse = require('csv-parse');
var stringify = require('csv-stringify');
var fs = require('fs'); 

var DB = {
    latestDBTime: 0,
    init: function(){
        var files = fs.readdirSync('./times/')
        for (var i = 0, len = files.length; i < len; i++) {
            if (files[i].split(".")[0] > this.latestDBTime) {
                this.latestDBTime = files[i].split(".")[0];
            }
        }
        if (this.latestDBTime == 0) {
            var now = new Date();
            this.latestDBTime = now.getTime();
        }
    },
    current: function(){
        return `./times/${this.latestDBTime}.csv`
    },
    next:function() {
        var now = new Date();
        this.latestDBTime = now.getTime();
        return this.current();
    }
}
DB.init();

function isCheckedIn(name) {
    var isCheckedIn = false;
    return new Promise((resolve, reject) => {
        fs.createReadStream(DB.current())
        .pipe(parse({delimiter: ','}))
        .on('data', function(row) {
            console.log(`${row[0]}`)
            if (row[0] == name) {
                if (row[1] > 0) {
                    console.log(`${name} checked in.`)
                    isCheckedIn = true;
                }
                if (row[2] > 0) {
                    console.log(`${name} checked out.`)
                    isCheckedIn = false;
                }
            }     
        })
        .on('end',function() {
            resolve(isCheckedIn)
        });
    })
}

module.exports = function(app){

    app.get('/api/people', function(req, res){
        var people = [];
        fs.createReadStream('./volunteers.csv')
            .pipe(parse({delimiter: ','}))
            .on('data', function(row) {
                console.log(row);
                //do something with csvrow
                people.push({
                    name: row[0]
                });
            })
            .on('end',function() {
                res.send(people);
            });
    });

    app.get('/api/isCheckedIn', function(req, res){
        var who = req.query.name;
        isCheckedIn(who).then((isCheckedIn) => {
            res.send({
                isCheckedIn
            });
        })
    });

    app.put('/api/time', function(req, res){
        var who = req.query.name;
        var type = req.query.type;
        var startTime = req.query.startTime;
        var newTime = req.query.newTime;
        var newTimes = [];

        if (type != "start" && (type != "end" && type != "remove")) {
            throw new Error("Invalid type of type of time to edit.");
        }

        fs.createReadStream(DB.current())
        .pipe(parse({delimiter: ','}))
        .on('data', function(row) {
            if (row[0] == who && row[1] == startTime) {
                if (type == "start") {
                    row[1] = newTime;
                } else if (type == "end") {
                    row[2] = newTime;
                } else if (type == "remove") {
                    return;
                }
            }
            newTimes.push(row)
        })
        .on('end',function() {
            var writeStream = fs.createWriteStream(DB.next())
            var generateCSV = stringify(newTimes, {delimiter: ','}).pipe(writeStream)
            res.send([]);
        });
    });

    app.get('/api/checkIn', function(req, res){
        var who = req.query.name;
        isCheckedIn(who).then((isCheckedIn) => {
            if(isCheckedIn == false){
                fs.appendFile(DB.current(), `${who},${Date.now() / 1000},\n`, function (err) {
                    if (err) throw err;
                    console.log('Saved!');
                    res.send({
                        isCheckedIn: true 
                    });
                });
            } else {
                res.send({
                    isCheckedIn: true 
                });
            }
        })
    })

    app.get('/api/checkOut', function(req, res){
        var who = req.query.name;
        isCheckedIn(who).then((isCheckedIn) => {
            if(isCheckedIn == true){
                var modified = [];
                var startTime = 0;
                fs.createReadStream(DB.current()).pipe(parse({delimiter: ','}))
                .on('data', (row) => {
                    if (row[0].indexOf(who) == 0 && row[2] == "") {
                        row[2] = Date.now() / 1000;
                        startTime = row[1];
                    }
                    modified.push(row)
                }).on('end', () => {
                    var writeStream = fs.createWriteStream(DB.next())
                    var generateCSV = stringify(modified, {delimiter: ','}).pipe(writeStream)
                    res.send({
                        isCheckedIn: false,
                        modified: true,
                        startTime: startTime
                    });
                })
            } else {
                res.send({
                    isCheckedIn: isCheckedIn,
                    modified: false
                });
            }
        })
    })
    app.get('/api/totals', function(req, res){
        var names = []
        var results = []
        fs.createReadStream(DB.current())
        .pipe(parse({delimiter: ','}))
        .on('data', function(row) {
            var index = names.indexOf(row[0])
            if (index < 0) {
                index = results.length
                results.push({
                    name: row[0],
                    total: 0,
                    numberOfCheckIns: 0,
                    isCheckedIn: false
                })
                names.push(row[0])
            }
            results[index].numberOfCheckIns++;
            if (row[2] > row[1]) {
                results[index].total += row[2] - row[1];
            } else {
                var now = new Date();
                results[index].total += (now.getTime() / 1000) - row[1];
                results[index].isCheckedIn = true;
            }
        })
        .on('end',function() {
            if (req.query.exportType == "csv") {
                res.setHeader('Content-disposition', 'attachment; filename=totals.csv');
                res.set('Content-Type', 'text/csv');
                var makeCSV = stringify(results.map(row => {
                    return [row.name, row.total, row.numberOfCheckIns]
                })).pipe(res);
                res.on('end', function() {
                    res.status(200).end();
                });
            } else {
                res.send(results);
            }
        });
        
    })
    app.get('/api/times', function(req, res){
        var who = req.query.name;
        var results = []
        fs.createReadStream(DB.current())
        .pipe(parse({delimiter: ','}))
        .on('data', function(row) {
            if (row[0] == who) {
                results.push({
                    name: row[0],
                    startTime: parseFloat(row[1]),
                    endTime: parseFloat(row[2])
                });
            }
        })
        .on('end',function() {
            res.send(results);
        });
        
    })
    //other routes..
}