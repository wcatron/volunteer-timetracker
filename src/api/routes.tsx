import { isNumber } from "util";

var parse = require('csv-parse');
var stringify = require('csv-stringify');
var fs = require('fs'); 

var DB = {
    latestDBTime: 0,
    currentCategory: 'Uncategorized',
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
            fs.writeFile(this.current(), '');
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
                people.push({
                    name: row[0]
                });
            })
            .on('end',function() {
                res.send(people);
            });
    });

    app.get('/api/categories', function(req, res){
        var people = [];
        fs.createReadStream('./categories.csv')
            .pipe(parse({delimiter: ','}))
            .on('data', function(row) {
                people.push({
                    category: row[0],
                    current: (DB.currentCategory == row[0])
                });
            })
            .on('end',function() {
                res.send(people);
            });
    });

    app.get('/api/currentCategory', function(req, res){
        res.send(
            {
                "category": DB.currentCategory 
            }
        );
    });

    app.put('/api/currentCategory', function(req, res){
        DB.currentCategory = req.query.category;
        res.send(
            {
                "category": DB.currentCategory 
            }
        );
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
        var newValue = req.query.newValue;
        var newValues = [];

        if ((type != "start" && type != "end") && (type != "category" && type != "remove")) {
            throw new Error("Invalid type of type of time to edit.");
        }

        fs.createReadStream(DB.current())
        .pipe(parse({delimiter: ','}))
        .on('data', function(row) {
            if (row[0] == who && row[1] == startTime) {
                if (type == "start") {
                    row[1] = newValue;
                } else if (type == "end") {
                    row[2] = newValue;
                } else if (type == "category") {
                    row[3] = newValue;
                } else if (type == "remove") {
                    return;
                }
            }
            newValues.push(row)
        })
        .on('end',function() {
            var writeStream = fs.createWriteStream(DB.next())
            var generateCSV = stringify(newValues, {delimiter: ','}).pipe(writeStream)
            res.send([]);
        });
    });

    app.get('/api/checkIn', function(req, res){
        var who = req.query.name;
        isCheckedIn(who).then((isCheckedIn) => {
            if(isCheckedIn == false){
                fs.appendFile(DB.current(), `${who},${Date.now() / 1000},,${DB.currentCategory}\n`, function (err) {
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
        var category = DB.currentCategory;
        if (req.query.category != null) {
            category = req.query.category;
        }

        var names = []
        var results = []
        fs.createReadStream(DB.current())
        .pipe(parse({delimiter: ','}))
        .on('data', function(row) {
            if (row[3] != category && category !== "*") {
                return;
            }
            var index = names.indexOf(row[0])
            if (index < 0) {
                index = results.length
                results.push({
                    name: row[0],
                    total: 0,
                    numberOfCheckIns: 0,
                    isCheckedIn: false,
                    issue: false
                })
                names.push(row[0])
            }
            results[index].numberOfCheckIns++;
            var duration;
            if (row[2] > row[1]) {
                duration = row[2] - row[1];
            } else {
                var now = new Date();
                duration = (now.getTime() / 1000) - row[1];
                results[index].isCheckedIn = true;
            }
            if (duration < (12 * 60 * 60)) {
                // Only add duration if less than 12 hours.
                results[index].total += duration;
            } else {
                // Flag issue if duration is greater than 12 hours.
                results[index].issue = true;
            }
        })
        .on('end',function() {
            if (req.query.exportType == "csv") {
                res.setHeader('Content-disposition', 'attachment; filename=totals.csv');
                res.set('Content-Type', 'text/csv');
                var makeCSV = stringify(results.map(row => {
                    return [row.name, row.total, row.numberOfCheckIns, row.issue]
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
                    endTime: parseFloat(row[2]),
                    category: row[3]
                });
            }
        })
        .on('end',function() {
            res.send(results);
        });
        
    })
    //other routes..
}