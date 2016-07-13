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
	var chart = Util.getTemplate("pie-basic");

	var options = { waitTime: 10, log: true, version: 1.4};
	var reportData = {
		reportDescription: {
			reportSuiteID: "guardiangu-globalapps-prod",
			dateFrom: Util.dates.aDayAgo,
			dateTo: Util.dates.aDayAgo,
			//dateGranularity: "day",
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

		chart.chart.renderTo = "versionSpread";
		chart.series[0].name = "App version";
		chart.series[0].data = highChartSeriesDataFrom(response).map(function(elem){elem.name = Util.abbreviatedVersionNumber(elem.name);return elem});
		chart.title.text = "App version";
		chart.plotOptions.pie = {dataLabels:{enabled:true,distance:-50,style:{fontWeight:'bold',color:'white',textShadow:'0px 1px 2px black'}}};

		console.log("*****************");
		console.log(JSON.stringify(chart.series[0].data));
		console.log("*****************");
		callback(null, chart);
	});
}

function highChartSeriesDataFrom(data) {
	var arr = [];
	data.report.data.forEach(function(item) {
		arr.push({name: item.name, y:parseInt(item.counts[0])});
	});
	return arr;//[{ name: 'iPhone7,2', y: 11111, drilldown: 'iPhone7,2' }, ...]
}
