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

	var js = '$("#' + chart.chart.renderTo + 'Text").text("' + chart.series[0].data[6].toFixed(2) + '%");'
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
	var chart = Util.getTemplate("line-basic");
	var appid = "Guardian/4.4.664"

	var options = { waitTime: 10, log: true, version: 1.4};
	var reportData = {
		reportDescription: {
			reportSuiteID: "guardiangu-globalapps-prod",
			dateFrom: Util.dates.aWeekAgo,
			dateTo: Util.dates.aDayAgo,
			dateGranularity: "day",
			elements: [{ id: "mobileappid", top: "3" }],
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
		chart.xAxis.categories = highChartCategoriesFrom(response);
		chart.series = adoptionSeriesFromOmniture(response, appid);
		Util.print(chart.series)
		chart.legend.enabled = false;
		chart.title.text = "";
		chart.subtitle.text = "";
		chart.yAxis.title.text = "";
		chart.tooltip.pointFormat = "{series.name}: <b>{point.y:,.2f}%</b><br/>";
		chart.series[0].color = "rgb(67,67,72)";
		chart.plotOptions = {line:{marker:{enabled: false}}};

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

function adoptionSeriesFromOmniture(response, appid) {
	var data = response.report.data.map(function(elem) {
		result = elem.breakdown.find(function(version) { return version.name === appid})
		if(typeof result === "undefined")
			return 0;
		else
			return result.counts[0] / elem.breakdownTotal * 100;
	});

	return [{name:appid.substring(9)+" adoption", data:data}]
}
