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
	$("#memDisplayiOS8").addClass("${display.ios8.background}");
	$("#memDisplayiOS8").prop('title', '${display.ios8.stats}');
	$("#memDisplayiOS8").html('${display.ios8.icon}');
	$("#memDisplayiOS9").addClass("${display.ios9.background}");
	$("#memDisplayiOS9").prop('title', '${display.ios9.stats}');
	$("#memDisplayiOS9").html('${display.ios9.icon}');
	$("#memDisplayiOS10").addClass("${display.ios10.background}");
	$("#memDisplayiOS10").prop('title', '${display.ios10.stats}');
	$("#memDisplayiOS10").html('${display.ios10.icon}');
	$("#memPurchaseiOS8").addClass("${purchase.ios8.background}");
	$("#memPurchaseiOS8").prop('title', '${purchase.ios8.stats}');
	$("#memPurchaseiOS8").html('${purchase.ios8.icon}');
	$("#memPurchaseiOS9").addClass("${purchase.ios9.background}");
	$("#memPurchaseiOS9").prop('title', '${purchase.ios9.stats}');
	$("#memPurchaseiOS9").html('${purchase.ios9.icon}');
	$("#memPurchaseiOS10").addClass("${purchase.ios10.background}");
	$("#memPurchaseiOS10").prop('title', '${purchase.ios10.stats}');
	$("#memPurchaseiOS10").html('${purchase.ios10.icon}');
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
	var appid = GuardianApp.getLatestiOSAppId();

	var options = { waitTime: 10, log: true, version: 1.4};
	var reportData = {
		reportDescription: {
			reportSuiteID: "guardiangu-globalapps-prod",
			dateFrom: Util.dates.twoDaysAgo,
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
		Util.print(purchaseSeries);


		var display = {};
		display.ios8 = resultFor("iOS 8", displaySeries);
		display.ios9 = resultFor("iOS 9", displaySeries);
		display.ios10 = resultFor("iOS 10", displaySeries);

		var purchase = {};
		purchase.ios8 = resultFor("iOS 8", purchaseSeries);
		purchase.ios9 = resultFor("iOS 9", purchaseSeries);
		purchase.ios10 = resultFor("iOS 10", purchaseSeries);

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
