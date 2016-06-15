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

generateChart(function(err, chart) {
	if(err) {
		throw err;
	}

	var js = '$("#' + chart.chart.renderTo + 'Text").text("' + chart.series[0].data[chart.series[0].data.length - 1].toFixed(2) + '%");'
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
	var chart = Util.getTemplate("custom-line-compact-percentage");
	var appid = GuardianApp.getLatestAndroidAppId();

	var options = { waitTime: 10, log: true, version: 1.4};
	var reportData = {
		reportDescription: {
			reportSuiteID: "guardiangu-globalapps-prod",
			dateFrom: Util.dates.aWeekAgo,
			dateTo: Util.dates.aDayAgo,
			dateGranularity: "day",
			elements: [{ id: "mobileappid", selected: [appid] }],
			segments: [{id:"s1218_55facf7ae4b08d193fc26205"},{id:"55508808e4b0b5455b979744"}],
			metrics: [{id:"uniquevisitors"}]
		}
	};

	var report = new Report(username, secret, 'sanJose', options)
		
	report.request("Report.Queue", reportData, function(err, response){
		if (err) {
			callback(err);
		}


		console.log(JSON.stringify(response));

		chart.chart.renderTo = "adoption";
		chart.xAxis.categories = Util.arrayOfDatesFromOmnitureData(response);
		chart.series = adoptionSeriesFromOmniture(response, appid);

		callback(null, chart);
	});
}

function adoptionSeriesFromOmniture(response, appid) {
	var data = response.report.data.map(elem => elem.breakdown[0].counts[0] / elem.breakdownTotal * 100);
	return [{name:appid.substring(9)+" adoption", data:data}]
}
