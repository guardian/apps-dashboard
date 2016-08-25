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

generateChart(function(err, display, purchase) {
	if(err) {
		throw err;
	}

	var js = `
	$("#memDisplayAndroid4").addClass("${display.android4.background}");
	$("#memDisplayAndroid4").prop('title', '${display.android4.stats}');
	$("#memDisplayAndroid4").html('${display.android4.icon}');
	$("#memDisplayAndroid5").addClass("${display.android5.background}");
	$("#memDisplayAndroid5").prop('title', '${display.android5.stats}');
	$("#memDisplayAndroid5").html('${display.android5.icon}');
	$("#memDisplayAndroid6").addClass("${display.android6.background}");
	$("#memDisplayAndroid6").prop('title', '${display.android6.stats}');
	$("#memDisplayAndroid6").html('${display.android6.icon}');
	$("#memPurchaseAndroid4").addClass("${purchase.android4.background}");
	$("#memPurchaseAndroid4").prop('title', '${purchase.android4.stats}');
	$("#memPurchaseAndroid4").html('${purchase.android4.icon}');
	$("#memPurchaseAndroid5").addClass("${purchase.android5.background}");
	$("#memPurchaseAndroid5").prop('title', '${purchase.android5.stats}');
	$("#memPurchaseAndroid5").html('${purchase.android5.icon}');
	$("#memPurchaseAndroid6").addClass("${purchase.android6.background}");
	$("#memPurchaseAndroid6").prop('title', '${purchase.android6.stats}');
	$("#memPurchaseAndroid6").html('${purchase.android6.icon}');
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
		Util.print(displaySeries);


		var display = {};
		display.android4 = resultFor("Android 4", displaySeries);
		display.android5 = resultFor("Android 5", displaySeries);
		display.android6 = resultFor("Android 6", displaySeries);

		var purchase = {};
		purchase.android4 = resultFor("Android 4", purchaseSeries);
		purchase.android5 = resultFor("Android 5", purchaseSeries);
		purchase.android6 = resultFor("Android 6", purchaseSeries);

		Util.print(display);
		Util.print(purchase);

		callback(null, display, purchase);
	});
}

function seriesWithIndex(i, response) {
	return response.report.data.map(item => item.breakdown[i]);
}

// _.compact removes all nulls
function resultFor(version, data) {
	var breakdowns = _.compact(_.flatMap(data, e => e.breakdown));
	var filtered = _.filter(breakdowns, b => b.name.includes(version));
	var total = _.reduce(filtered, (sum, f) => sum + parseInt(f.counts[0]), 0);
	console.log(version + ":" + total);
	return total > 0 ? {background:"bg-success", icon:'<i class="fa fa-check" aria-hidden="true"></i>', stats:total} : {background:"bg-danger", icon:'<i class="fa fa-remove" aria-hidden="true"></i>', stats:total};
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
