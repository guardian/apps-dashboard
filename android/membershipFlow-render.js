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

generateChart(function(err, displayCheckMark, paymentCheckMark) {
	if(err) {
		throw err;
	}

	var js = `
	$("#memDisplayAndroid4").addClass("${displayCheckMark.android4}");
	$("#memDisplayAndroid5").addClass("${displayCheckMark.android5}");
	$("#memDisplayAndroid6").addClass("${displayCheckMark.android6}");
	$("#memPurchaseAndroid4").addClass("${paymentCheckMark.android4}");
	$("#memPurchaseAndroid5").addClass("${paymentCheckMark.android5}");
	$("#memPurchaseAndroid6").addClass("${paymentCheckMark.android6}");
	`;

	var filename = "membershipFlow.js"
	fs.writeFile(filename, js, function(err) {
		if(err) {
			throw err;
		}

		console.log(filename + " was saved!");
	}); 
});

function generateChart(callback) {
	var chart = Util.getTemplate("custom-line-compact");
	var appid = GuardianApp.getLatestAndroidAppId();

	var options = { waitTime: 10, log: true, version: 1.4};
	var reportData = {
		reportDescription: {
			reportSuiteID: "guardiangu-globalapps-prod",
			dateFrom: Util.dates.aWeekAgo,
			dateTo: Util.dates.yesterday,
			dateGranularity: "day",
			elements: [{ id: "page", selected:["Membership-ThankYou", "PaymentScreen-Entry"]}, {id: "mobileosversion", top:"20"}],
			segments: [{id:"s1218_55facf7ae4b08d193fc26205"}, {element:"mobileappid", selected:[appid]}],
			metrics: [{id:"pageviews"}]
		}
	};

	var report = new Report(username, secret, 'sanJose', options)

	report.request("Report.Queue", reportData, function(err, response){
		if(err) throw new Error(err.message);

		console.log(JSON.stringify(response));
		console.log("*****************");
        
		var displaySeries = seriesWithIndex(1, response);
		var purchaseSeries = seriesWithIndex(0, response);

		var displayCheckMark = {};
		displayCheckMark.android4 = checkMarkFor("Android 4", displaySeries);
		displayCheckMark.android5 = checkMarkFor("Android 5", displaySeries);
		displayCheckMark.android6 = checkMarkFor("Android 6", displaySeries);

		var purchaseCheckMark = {};
		purchaseCheckMark.android4 = checkMarkFor("Android 4", purchaseSeries);
		purchaseCheckMark.android5 = checkMarkFor("Android 5", purchaseSeries);
		purchaseCheckMark.android6 = checkMarkFor("Android 6", purchaseSeries);

		Util.print(displayCheckMark);
		Util.print(purchaseCheckMark);

		callback(null, displayCheckMark, purchaseCheckMark);
	});
}

function seriesWithIndex(i, response) {
	return response.report.data.map(item => item.breakdown[i]);
}

function checkMarkFor(version, data) {
	var breakdowns = _.flatMap(data, e => e.breakdown);
	var filtered = _.filter(breakdowns, b => b ? b.name.includes(version) : false);
	var total = _.reduce(filtered, (sum, f) => sum + parseInt(f.counts[0]), 0);
	console.log(version + ":" + total);
	return total > 0 ? "status_good" : "status_bad";
}

function highChartSeriesFrom(response) {
	var thankyou = response.report.data.map(item => parseInt(item.breakdown[0].counts[0]));
	var payment = response.report.data.map(item => parseInt(item.breakdown[1].counts[0]));
	return [{name:"Thank you screens", data:thankyou},{name:"Payment screens", data:payment, yAxis:1}]
}
