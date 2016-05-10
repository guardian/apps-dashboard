var Report = require('nomniture').Report;
var Util = require('./Util.js');
var moment = require ('moment');
var nconf = require('nconf');
var _ = require('lodash');
var fs = require('fs');

nconf.file({ file: '../config.json' });
var username = nconf.get('username');
var secret = nconf.get('secret');
console.log('username is ' + username);
console.log('secret is ' + secret);

generateText(function(err, totalSales) {
	if(err) {
		throw err;
	}

	var js = '$("#membershipParagraph").text("Membership in apps has contributed £' + (totalSales * 5) + '/month to The Guardian.");';
	var filename = "membershipParagraph.js";
	console.log(js);
	fs.writeFile(filename, js, function(err) {
		if(err) {
			throw err;
		}

		console.log(filename + " was saved!");
	}); 
});

function generateText(callback) {
	var options = { waitTime: 10, log: true, version: 1.4};
	var reportData = {
		reportDescription: {
			reportSuiteID: "guardiangu-globalapps-prod",
			dateFrom: Util.dates.aMonthAndADayAgo,
			dateTo: Util.dates.yesterday,
			elements: [{ id: "page", search:{"keywords":["Membership-ThankYou"]}}, { id: "prop19", selected:["iOS App", "Android"]}],
			segments: [{id:"s1218_55facf7ae4b08d193fc26205"}],
			metrics: [{id:"pageviews"}]
		}
	};

	var report = new Report(username, secret, 'sanJose', options)

	report.request("Report.Queue", reportData, function(err, response){
		if(err) throw new Error(err.message);

		console.log(JSON.stringify(response));
		console.log("*****************");

		var totalSales = parseInt(response.report.data[0].counts[0]);

		callback(null, totalSales);
	});
}
