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
		//process.exit(1);

		chart.chart.renderTo = "membershipThankYou";
		chart.xAxis.categories = highChartCategoriesFrom(response);
		chart.series = highChartSeriesFrom(response);
		chart.legend.layout = 'vertical';
		chart.legend.align = 'right';
		chart.legend.verticalAlign = 'top';
		chart.legend.floating = true;
		chart.legend.backgroundColor = '#FFFFFF';
		chart.title.text = "Last 2 weeks";
		chart.title.x = 0;
		chart.subtitle.text = "";
		chart.yAxis.title.text = "Thank you screen page views";
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
	var intermediate = {"Android": [], "iOS": []};
	data.report.data.forEach(function(item) {
		item.breakdown.forEach(function(breakdown) {
			var apps = breakdown.breakdown.reduce(function(prev, curr){prev[curr.name] = parseInt(curr.counts[0]);return prev}, {})
			console.log(JSON.stringify(apps));
			intermediate.Android.push(apps["Android"] | 0);
			intermediate.iOS.push(apps["iOS App"] | 0);
		});
	});

	Object.keys(intermediate).forEach(function(category){
		console.log(category);
		console.log(intermediate[category]);
		arr.push({name: category, data: intermediate[category]});
	})

	return arr;
}
