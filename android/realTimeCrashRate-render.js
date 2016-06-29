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

generateChart(function(err, chart) {
	if(err) {
		console.log(JSON.stringify(err.message))
		throw err;
	}

	//var currentCrashRate = chart.series[0].data[6];

	//if (currentCrashRate <= 0.29) {
	//	var color = "green";
	//} else if (currentCrashRate <= 0.69){
	//	var color = "amber";
	//} else {
	//	var color = "red";
	//}


	//var js = `
	//$("#${chart.chart.renderTo}Text").text("${currentCrashRate}%");
	//$("#${chart.chart.renderTo}Text").addClass("${color}");
	//new Highcharts.Chart(${Util.stringify(chart)});
	//`;
	//console.log(js);

	//var filename = chart.chart.renderTo + ".js"
	//fs.writeFile(filename, js, function(err) {
	//	if(err) {
	//		throw err;
	//	}

	//	console.log(filename + " was saved!");
	//}); 
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
		cc.errorGraph(["5457bc14d478bc2b14000002"],"crashPercent", 1440, {appVersion: appVersion}, function(err, result){
			if (err) {
				callback(err);
			}

			console.log(JSON.stringify(result));

			console.log("Crash rate is " + result.data.series[0].points[0] + "%");


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
