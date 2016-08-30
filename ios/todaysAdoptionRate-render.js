var CrittercismClient = require('../lib/CrittercismClient.js');
var Util = require('../lib/Util.js');
var moment = require ('moment');
var nconf = require('nconf');
var moment = require('moment');
var fs = require('fs');
var GuardianApp = require('../lib/GuardianApp.js');

nconf.file({ file: '../config.json' });
var username = nconf.get('crittercism_username');
var password = nconf.get('crittercism_password');
var clientid = nconf.get('crittercism_clientid');

generateText(function(err, adoption) {
	if(err) {
		console.log(JSON.stringify(err.message))
		throw err;
	}

	console.log("Adoption is " + adoption + "%");

	var js = `
	$("#todaysAdoptionRate").text("${(adoption*100).toFixed(1)}%");
	$("#currentAdoptionRate").text("${(adoption*100).toFixed(1)}%");
	`;
	console.log(js);

	var filename = "todaysAdoptionRate.js"
	fs.writeFile(filename, js, function(err) {
		if(err) {
			throw err;
		}

		console.log(filename + " was saved!");
	}); 
});

 
function generateText(callback) {
        var chart = Util.getTemplate("custom-line-compact-percentage");
	var appVersion = GuardianApp.getLatestiOSAppVersion();
	var cc = new CrittercismClient(clientid, "4f841104b0931561860003fc");

	cc.init(username, password, function(err) {
		if (err) {
			callback(err);
		}

		console.log('Crittercism API client initialized');
		var startOfToday = moment().startOf("day").format();
		cc.trends(startOfToday, function(err, result){
			if (err) {
				callback(err);
			}

			var dau = result.series.dauByVersion.todayTopValues;
			var dauForVersion = dau[appVersion];
			Util.print(dau);
			var adoption ="0";
			if(dauForVersion) {
				var totalDau = Object.keys(dau).reduce((sum, p) => sum + dau[p], 0)
				adoption = dauForVersion / totalDau;
			}

			callback(null, adoption);
		});
	});
};
