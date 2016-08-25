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

generateChart(function(err, result) {
	if(err) {
		throw err;
	}


	var js = `
	$("#subsRecoveryAndroid4").addClass("${result.android4.background}");
	$("#subsRecoveryAndroid4").prop('title', '${result.android4.stats}');
	$("#subsRecoveryAndroid4").html('${result.android4.icon}');
	$("#subsRecoveryAndroid5").addClass("${result.android5.background}");
	$("#subsRecoveryAndroid5").prop('title', '${result.android5.stats}');
	$("#subsRecoveryAndroid5").html('${result.android5.icon}');
	$("#subsRecoveryAndroid6").addClass("${result.android6.background}");
	$("#subsRecoveryAndroid6").prop('title', '${result.android6.stats}');
	$("#subsRecoveryAndroid6").html('${result.android6.icon}');
	`;
	console.log(js);

	var filename = "subsRecoveryFlow.js";
	fs.writeFile(filename, js, function(err) {
		if(err) {
			throw err;
		}

		console.log(filename + " was saved!");
	}); 
});

function generateChart(callback) {
	var appid = GuardianApp.getLatestAndroidAppId();

	var options = { waitTime: 10, log: true, version: 1.4};
	var reportData = {
		reportDescription: {
			reportSuiteID: "guardiangu-globalapps-prod",
			dateFrom: Util.dates.aWeekAgo,
			dateTo: Util.dates.yesterday,
			dateGranularity: "day",
			elements: [{id: "mobileosversion", top:"20"}],
			segments: [{id:"s1218_55facf7ae4b08d193fc26205"}, {element:"mobileappid", selected:[appid]}, {element: "mobileaction", selected:["Subscription-Purchase"]}, {element:"evar5", selected:["Print"]}],
			metrics: [{id:"instances"}]
		}
	};

	var report = new Report(username, secret, 'sanJose', options)

	report.request("Report.Queue", reportData, function(err, response){
		if(err) throw new Error(err.message);

		console.log(JSON.stringify(response));
		console.log("*****************");


		var result = {};
		result.android4 = resultFor("Android 4", response.report.data);
		result.android5 = resultFor("Android 5", response.report.data);
		result.android6 = resultFor("Android 6", response.report.data);
        
		callback(null, result);
	});
}

// _.compact removes all nulls
function resultFor(version, data) {
	var breakdowns = _.compact(_.flatMap(data, e => e.breakdown));
	var filtered = _.filter(breakdowns, b => b.name.includes(version));
	var total = _.reduce(filtered, (sum, f) => sum + parseInt(f.counts[0]), 0);
	console.log(version + ":" + total);
	return total > 0 ? {background:"bg-success", icon:'<i class="fa fa-check" aria-hidden="true"></i>', stats:total} : {background:"bg-danger", icon:'<i class="fa fa-remove" aria-hidden="true"></i>', stats:total};
}

function checkMarkFor(version, response) {
	var breakdowns = _.flatMap(response.report.data, e => e.breakdown);
	var filtered = _.filter(breakdowns, b => b.name.includes(version));
	var total = _.reduce(filtered, (sum, f) => sum + parseInt(f.counts[0]), 0);
	console.log(version + ":" + total);
	return total > 0 ? "status_good" : "status_bad";
}

function highChartSeriesFrom(response) {
	var recoveries = response.report.data.map(item => parseInt(item.breakdown[0].counts[0]));
	return [{name:"Print subscription recoveries", data:recoveries}]
}
