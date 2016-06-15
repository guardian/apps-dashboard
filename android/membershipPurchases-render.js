var Report = require('nomniture').Report;
var Util = require('./Util.js');
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

generateChart(function(err, chart) {
	if(err) {
		throw err;
	}

	var totalMembershipPurchases = chart.series[0].data.reduce((a, b) => a + b);
	var js = '$("#' + chart.chart.renderTo + 'Text").text("' + Util.numberWithCommas(totalMembershipPurchases) + '");';
	js += "new Highcharts.Chart(" + JSON.stringify(chart) + ");";
	var filename = chart.chart.renderTo + ".js"
	console.log(js);
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
			elements: [{ id: "page", selected:["Membership-ThankYou"]}],
			segments: [{id:"s1218_55facf7ae4b08d193fc26205"}, {element:"mobileappid", selected:[appid]}],
			metrics: [{id:"pageviews"}]
		}
	};

	var report = new Report(username, secret, 'sanJose', options)

	report.request("Report.Queue", reportData, function(err, response){
		if(err) throw new Error(err.message);


		console.log(JSON.stringify(response));
		console.log("*****************");

		chart.chart.renderTo = "membershipPurchases";
		chart.xAxis.categories = Util.arrayOfDatesFromOmnitureData(response);
		chart.series = highChartSeriesFrom(response);
		chart.series[0].name = appid.substring(9) + " memberships";

		callback(null, chart);
	});
}

function highChartSeriesFrom(omniture) {
	var data = omniture.report.data.map(elem => parseInt(elem.breakdown[0].counts[0]));
	return [{name: "placeholder", data: data}]; 
}