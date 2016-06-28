var Report = require('nomniture').Report;
var Util = require('../lib/Util.js');
var moment = require ('moment');
var nconf = require('nconf');
var _ = require('lodash');
var fs = require('fs');

nconf.file({ file: '../config.json' });
var username = nconf.get('username');
var secret = nconf.get('secret');
console.log('username is ' + username);
console.log('secret is ' + secret);

generateChart(function(err, chart) {
	if(err) {
		throw err;
	}

	var js = "new Highcharts.Chart(" + JSON.stringify(chart) + ");";
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
	var chart = Util.getTemplate("line-basic");

	var options = { waitTime: 10, log: true, version: 1.4};
	var reportData = {
		reportDescription: {
			reportSuiteID: "guardiangu-globalapps-prod",
			dateFrom: Util.dates.aMonthAndADayAgo,
			dateTo: Util.dates.yesterday,
			dateGranularity: "day",
			elements: [{ id: "mobileappid", top: "3" }],
			segments: [{id:"s1218_55facf7ae4b08d193fc26205"},{id:"5550876be4b0b5455b979741"}],
			metrics: [{id:"uniquevisitors"}]
		}
	};

	var report = new Report(username, secret, 'sanJose', options)

	report.request("Report.Queue", reportData, function(err, response){
		if (err) {
			callback(err);
		}

		console.log(JSON.stringify(response));
		console.log("*****************");

		chart.chart.renderTo = "versionSpreadMonth"
		chart.xAxis.categories = highChartCategoriesFrom(response);
		chart.series = highChartSeriesFrom(response).map(function(elem){elem.name = Util.abbreviatedVersionNumber(elem.name);return elem});
		chart.title.text = Util.humanReadbleDate(reportData.reportDescription.dateFrom) + ' to ' + Util.humanReadbleDate(reportData.reportDescription.dateTo);
		chart.subtitle.text = "";
		chart.yAxis.title.text = "Unique visitors"
		callback(null, chart);
	});
}

function highChartCategoriesFrom(data) {
	var arr = [];
	data.report.data.forEach(function(item) {
		arr.push(item.name);
	});
	return arr;//['1 Feb', '2 Feb', '3 Feb']
}

function highChartSeriesFrom(data) {
	var arr = [];
	var numberOfCategories = data.report.data.length;
	var intermediate = {};
	for(var i = 0;i < data.report.data.length; i++) {
		var item = data.report.data[i];
		item.breakdown.forEach(function(breakdown) {
			if(typeof intermediate[breakdown.name] === "undefined") {
				intermediate[breakdown.name] = new Array(numberOfCategories);
				for(var j = 0; j < numberOfCategories; j++) {
					intermediate[breakdown.name][j] = 0;
				}
			}
			intermediate[breakdown.name][i] = parseInt(breakdown.counts[0]);
		});
	}

	Object.keys(intermediate).forEach(function(category){
		console.log(category);
		console.log(intermediate[category]);
		arr.push({name: category, data: intermediate[category]});
	})

	return arr;
}
