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
			dateFrom: Util.dates.twoWeeksAgoAndADay,
			dateTo: Util.dates.yesterday,
			dateGranularity: "day",
			elements: [{ id: "page", top:"3", search:{"keywords":["Membership-ThankYou"]}}],
			segments: [{id:"s1218_55facf7ae4b08d193fc26205"}],
			metrics: [{id:"pageviews"}]
		}
	};

	var report = new Report(username, secret, 'sanJose', options)

	report.request("Report.Queue", reportData, function(err, response){
		if(err) throw new Error(err.message);

		console.log(JSON.stringify(response));
		console.log("*****************");
		//process.exit(1);

		chart.chart.renderTo = "membershipThankYou";
		chart.xAxis.categories = highChartCategoriesFrom(response);
		chart.series = highChartSeriesFrom(response);
		chart.legend.enabled = false;
		chart.title.text = "Membership Thank You screen";
		chart.title.x = 0;
		chart.subtitle.text = "";
		chart.yAxis.title.text = "Page views";
		chart.tooltip.pointFormat = "{series.name}: <b>{point.y:,.0f}</b><br/>";

		callback(null, chart);
	});
}

function highChartCategoriesFrom(data) {
	var arr = [];
	data.report.data.forEach(function(item) {
		//2013-02-08
		var dateString = item.year + "-" + item.month + "-" + item.day;
		arr.push(Util.shortDate(dateString));
	});
	return arr;//['1 Feb', '2 Feb', '3 Feb']
}

function highChartSeriesFrom(data) {
	var arr = [];
	var numberOfCategories = data.report.data.length;
	var intermediate = {};
	data.report.data.forEach(function(item) {
		item.breakdown.forEach(function(breakdown) {
			if(typeof intermediate[breakdown.name] === "undefined") {
				intermediate[breakdown.name] = [];
			}
			intermediate[breakdown.name].push(parseInt(breakdown.counts[0]));
		});
	});

	Object.keys(intermediate).forEach(function(category){
		console.log(category);
		console.log(intermediate[category]);
		arr.push({name: category, data: intermediate[category]});
	})

	return arr;
}
