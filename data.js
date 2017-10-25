var path = require('path');
var fs = require('fs');
var parse = require('csv-parse');
var dateformat = require('dateformat');

function doTheThing(row) {
    var result = {};

    var pieces = row[1].split('/');
    datetime = pieces[1] + '/' + pieces[0] + '/' + pieces[2] + ' ' + row[2];

    result.index = row[0];
    result.datetime = new Date(datetime);
    result.activity = row[3];
    result.marker = row[4];
    result.light = row[5];
    result.awake = row[6];
    result.status = row[7];

    return result;
}

var theData = {
    clocks: function(filename) {
        return new Promise((resolve, reject) => {
            fs.readFile(path.join(__dirname, 'data', filename), (error, buffer) => {
                let data = [];
                let result = [];

                console.log('FILENAME: ' + filename);
                
                if (error) {
                    console.log("Error: " + error);
                }
        
                parse(buffer, {}, (error, rows) => {
                    if (error) {
                        console.log("Error: " + error);
                    }
        
                    rows.forEach((row) => {
                        rr = doTheThing(row);
                        data.push(rr);
                    });
        
                    let entry = {
                        activities: [],
                        luminosity: []
                    };
                    let lastDay = data[0].datetime.getDate();
                    let lastHour = data[0].datetime.getHours();
                    let sumActivity = 0;
                    let sumLuminosity = 0;
        
                    function nextHour(min) {
                        lastHour = min.datetime.getHours();
                        entry.activities.push({ activity: sumActivity });
                        entry.luminosity.push(sumLuminosity);
                        sumActivity = parseInt(min.activity);
                        sumLuminosity = parseInt(min.light);
                    }
        
                    data.forEach((min) => {
                        if (min.datetime.getDate() != lastDay) {
                            nextHour(min);
        
                            result.push(entry);
                            lastDay = min.datetime.getDate();
                            lastHour = min.datetime.getHours();
                            entry = {
                                formattedDate: dateformat(min.datetime, 'yyyy-mm-dd h:MM'),
                                date: min.datetime,
                                day: lastDay,
                                activities: [],
                                luminosity: []
                            };
                        } else if (min.datetime.getHours() != lastHour) {
                            nextHour(min);
                        } else {
                            sumActivity += parseInt(min.activity);
                            sumLuminosity += parseInt(min.light);
                        }
                    });
                });
        
                resolve(result);
            });
        });
    },

    list: function() {
        return new Promise((resolve, reject) => {
            fs.readdir('./data', (err, items) => {
                resolve(items);
            });
        });
    }
}

module.exports = theData;
