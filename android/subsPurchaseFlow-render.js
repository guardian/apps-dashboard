var Report = require('nomniture').Report;
var Util = require('../lib/Util.js');
var moment = require ('moment');
var nconf = require('nconf');
var _ = require('lodash');
var fs = require('fs');
var GuardianApp = require('../lib/GuardianApp.js');

nconf.file({ file: '../config.json' });
var username = nconf.get('username');
var secret = nconf.get('secret');
console.log('username is ' + username);
console.log('secret is ' + secret);

generateChart(function(err, checkMark) {
	if(err) {
		throw err;
	}


	var js = `
	$("#subsPurchaseAndroid4").addClass("${checkMark.android4}");
	$("#subsPurchaseAndroid5").addClass("${checkMark.android5}");
	$("#subsPurchaseAndroid6").addClass("${checkMark.android6}");
	`;
	console.log(js);

	var filename = "subsPurchaseFlow.js";
	fs.writeFile(filename, js, function(err) {
		if(err) {
			throw err;
		}

		console.log(filename + " was saved!");
	}); 
});

function generateChart(callback) {
	var appid = GuardianApp.getLatestAndroidAppId();

	var options = { waitTime: 10, log: true, version: 1.4};
	var reportData = {
		reportDescription: {
			reportSuiteID: "guardiangu-globalapps-prod",
			dateFrom: Util.dates.aWeekAgo,
			dateTo: Util.dates.yesterday,
			dateGranularity: "day",
			elements: [{id: "mobileosversion", top:"20"}],
			segments: [{id:"s1218_55facf7ae4b08d193fc26205"}, {element:"mobileappid", selected:[appid]}, {element: "mobileaction", selected:["Subscription-Purchase"]}, {element:"evar5", selected:["Play"]}],
			metrics: [{id:"instances"}]
		}
	};

	var report = new Report(username, secret, 'sanJose', options)

	report.request("Report.Queue", reportData, function(err, response){
		if(err) throw new Error(err.message);

		console.log(JSON.stringify(response));
		console.log("*****************");


		var checkMark = {};
		checkMark.android4 = checkMarkFor("Android 4", response);
		checkMark.android5 = checkMarkFor("Android 5", response);
		checkMark.android6 = checkMarkFor("Android 6", response);
        
		callback(null, checkMark);
	});
}

function checkMarkFor(version, response) {
	var breakdowns = _.flatMap(response.report.data, e => e.breakdown);
	var filtered = _.filter(breakdowns, b => b.name.includes(version));
	var total = _.reduce(filtered, (sum, f) => sum + parseInt(f.counts[0]), 0);
	console.log(version + ":" + total);
	return total > 0 ? "status_good" : "status_bad";
}

function highChartSeriesFrom(response) {
	var recoveries = response.report.data.map(item => parseInt(item.breakdown[0].counts[0]));
	return [{name:"Print subscription recoveries", data:recoveries}]
}
