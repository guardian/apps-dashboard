var itc = require("itunesconnect");
var Util = require('./Util.js');
var _ = require("lodash");
var moment = require ('moment');
var nconf = require('nconf');
var fs = require('fs');

nconf.file({ file: '../config.json' });
var username = nconf.get('itc_username');
var secret = nconf.get('itc_secret');
console.log('username is ' + username);

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

	var Report = itc.Report;
	var itunes = new itc.Connect(username, secret);
	itunes.request(Report('timed', {filters:{content:[820984825, 820984826]},measures: [itc.measure.units, itc.measure.proceeds]}).time(24, 'months').interval('month'), function(err, result) {
		if (err) {
			callback(err);
		}
		console.log(JSON.stringify(result));

		chart.chart.renderTo = "revenue6Months";
		chart.title.text = "Subscription Revenue";
		chart.subtitle.text = "";
		chart.yAxis.title = "GBP";
		chart.legend.enabled = false;
            	chart.tooltip.pointFormat = "{series.name}: <b>{point.y:,.0f} £</b><br/>";

		chart.xAxis.categories = highchartCategoriesFromITCData(result);
		console.log(JSON.stringify(chart.xAxis.categories));
		chart.series = highChartSeriesFromITCData(result);
		console.log(JSON.stringify(chart.series));

		
		// Get rid of this month
		chart.xAxis.categories.pop();
		chart.series[0].data.pop();

		callback(null, chart);
	});
};


// [ {"date":"2015-09-01T00:00:00.000Z","Royalty":1.1,"units":1},{"date":"2015-10-01T00:00:00.000Z","Royalty":1.1,"units":1} ]
// // ["December", "November"]
function highchartCategoriesFromITCData(itc) {
	return itc[0].data.map(function(elem) {
		return moment(elem.date).format('MMMM');
	});
}

// [ {"date":"2015-09-01T00:00:00.000Z","Royalty":1.1,"units":1},{"date":"2015-10-01T00:00:00.000Z","Royalty":1.1,"units":1} ]
//[ {name: 'Subscriptions', data: [1, 23.7] }]
function highChartSeriesFromITCData(itc) {
	var name = 'Revenue';
	var data = itc[0].data.map(function(elem) {
		return elem.Royalty
	});

	return [{name:name, data:data}];
}
