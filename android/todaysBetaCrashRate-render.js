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

generateText(function(err, todaysCrashRate) {
	if(err) {
		console.log(JSON.stringify(err.message))
		throw err;
	}

	console.log("Crash rate is " + todaysCrashRate + "%");

	if (todaysCrashRate <= 0.29) {
		var color = "green";
	} else if (todaysCrashRate <= 0.69) {
		var color = "amber";
	} else {
		var color = "red";
	}


	var js = `
	$("#todaysBetaCrashRate").text("${todaysCrashRate}%");
	$("#currentBetaCrashRate").text("${todaysCrashRate}%");
	$("#todaysCrashRate").addClass("${color}");
	`;
	console.log(js);

	var filename = "todaysBetaCrashRate.js"
	fs.writeFile(filename, js, function(err) {
		if(err) {
			throw err;
		}

		console.log(filename + " was saved!");
	}); 
});

 
function generateText(callback) {
        var chart = Util.getTemplate("custom-line-compact-percentage");
	var appVersion = GuardianApp.getLatestAndroidBetaVersion();
	var cc = new CrittercismClient(clientid, "555484008172e25e67906d29");

	cc.init(username, password, function(err) {
		if (err) {
			callback(err);
		}

		console.log('Crittercism API client initialized');
		cc.errorGraph(["555484008172e25e67906d29"],"crashPercent", 1440, {appVersion: appVersion}, function(err, result){
			if (err) {
				callback(err);
			}

			console.log(JSON.stringify(result));

			callback(null, result.data.series[0].points[0]);
		});
	});
};
