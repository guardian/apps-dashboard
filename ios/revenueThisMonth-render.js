var itc = require("itunesconnect");
var Util = require('../lib/Util.js');
var _ = require("lodash");
var moment = require ('moment');
var nconf = require('nconf');
var fs = require('fs');

nconf.file({ file: '../config.json' });
var username = nconf.get('itc_username');
var secret = nconf.get('itc_secret');
console.log('username is ' + username);
 
generateText(function(err, revenue) {
	if(err) {
		throw err;
	}

	var js = '$("#revenueThisMonth").text("' + revenue.toFixed() + '");';
	var filename = "revenueThisMonth.js";
	console.log(js);
	fs.writeFile(filename, js, function(err) {
		if(err) {
			throw err;
		}

		console.log(filename + " was saved!");
	}); 
});

function generateText(callback) {
	var Report = itc.Report;
	// Connect to iTunes 
	var itunes = new itc.Connect(username, secret);
	 
	// Simple ranked report 
	itunes.request(Report('ranked', {start: Util.dates.firstOfMonth, end:Util.dates.yesterday, filters:{content:[820984825, 820984826]},measures: [itc.measure.units, itc.measure.proceeds]}), function(error, result) {
	    console.log(result);
	    var total = _.reduce(result, function(sum,n) {
			    return sum + n.Royalty
	    }, 0);
		callback(null, total);
	});
}
