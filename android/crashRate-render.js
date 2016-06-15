var CrittercismClient = require('../lib/CrittercismClient.js');
var Util = require('../lib/Util.js');
var moment = require ('moment');
var nconf = require('nconf');
var fs = require('fs');
var GuardianApp = require('../lib/GuardianApp.js');

nconf.file({ file: '../config.json' });
var username = nconf.get('crittercism_username');
var password = nconf.get('crittercism_password');
var clientid = nconf.get('crittercism_clientid');
console.log('username is ' + username);
console.log('clientid is ' + clientid);

generateChart(function(err, chart) {
	if(err) {
		console.log(JSON.stringify(err.message))
		throw err;
	}

	var js = '$("#' + chart.chart.renderTo + 'Text").text("' + chart.series[0].data[6] + '%");'
	var currentCrashRate = chart.series[0].data[6];

	if (currentCrashRate <= 0.29) {
		// add css style .green
		js += '$("#crashRateText").addClass("green");';

	} else if (currentCrashRate <= 0.3 && currentCrashRate >= 0.69){
		// add css style .amber
		js += '$("#crashRateText").addClass("amber");';
	} else {
		// add css style .red
		js += '$("#crashRateText").addClass("red");';
	}


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
	var appVersion = GuardianApp.getLatestAndroidAppVersion();
	var cc = new CrittercismClient(clientid);

	cc.init(username, password, function(err) {
		if (err) {
			callback(err);
		}

		console.log('Crittercism API client initialized');
		cc.errorGraph(["5457bc14d478bc2b14000002"],"crashPercent", 10080, {appVersion: appVersion}, function(err, result){
			if (err) {
				callback(err);
			}

			console.log(JSON.stringify(result));

			chart.chart.renderTo = "crashRate";
			chart.xAxis.categories = highchartCategoriesFromCrittercismData(result);
			chart.series = highChartSeriesFromCrittercismData(result);
			chart.series[0].name = appVersion + " crash rate"

			callback(null, chart);
		});
	});
};

// // ["December", "November"]
function highchartCategoriesFromCrittercismData(crit) {
	return Util.getArrayOfDatesBetweenDates(crit.data.start, crit.data.end).slice(1);
}

//[ {name: 'Subscriptions', data: [1, 23.7] }]
function highChartSeriesFromCrittercismData(crit) {
	var name = crit.data.series[0].name;
	var data = crit.data.series[0].points;

	return [{name:name, data:data}];
}
