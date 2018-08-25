import { isNumber } from "util";

var parse = require('csv-parse');
var fs = require('fs'); 

function isCheckedIn(name) {
    var isCheckedIn = false;
    return new Promise((resolve, reject) => {
        fs.createReadStream('./times.csv')
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

    app.get('/api/checkIn', function(req, res){
        var who = req.query.name;
        isCheckedIn(who).then((isCheckedIn) => {
            if(isCheckedIn == false){
                fs.appendFile('./times.csv', `${who},${Date.now() / 1000},\r\n`, function (err) {
                    if (err) throw err;
                    console.log('Saved!');
                    res.send({
                        isCheckedIn: true 
                    });
                });
            }
            
        })
    })

    app.get('/api/checkOut', function(req, res){
        var who = req.query.name;
        isCheckedIn(who).then((isCheckedIn) => {
            if(isCheckedIn == true){
                fs.readFile('./times.csv', 'utf8', function (err,data) {
                    if (err) {
                      return console.log(err);
                    }
                    var result = data.split('\r\n');

                    var modified = result.map(element => {
                        if (element.indexOf(who) == 0) {
                            if (element.split(',')[2] == "") {
                                return element += `${Date.now() / 1000}`
                            }
                        }
                        return element
                    });
                  
                    fs.writeFile('./times.csv', modified.join('\r\n'), 'utf8', function (err) {
                       if (err) return console.log(err);
                       res.send({
                            isCheckedIn: false 
                        });
                    });
                  });
            }
            
        })
    })
    app.get('/api/totals', function(req, res){
        var names = []
        var results = []
        fs.createReadStream('./times.csv')
        .pipe(parse({delimiter: ','}))
        .on('data', function(row) {
            console.log(`${row[0]}`)
            var index = names.indexOf(row[0])
            if (index < 0) {
                index = results.length
                results.push({
                    name: row[0],
                    total: 0,
                    isCheckedIn: false
                })
                names.push(row[0])
            }
            if (row[2] > row[1]) {
                results[index].total += row[2] - row[1];
            } else {
                results[index].isCheckedIn = true;
            }
        })
        .on('end',function() {
            res.send(results);
        });
        
    })
    app.get('/api/times', function(req, res){
        var who = req.query.name;
        var results = []
        fs.createReadStream('./times.csv')
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