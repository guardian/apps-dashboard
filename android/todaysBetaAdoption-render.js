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

generateText(function(err, adoptionRate, uniques) {
	if(err) {
		console.log(JSON.stringify(err.message))
		throw err;
	}

	var js = `
	$("#todaysBetaAdoptionRate").text("${(adoptionRate*100).toFixed(1)}%");
	$("#currentBetaAdoptionRate").text("${(adoptionRate*100).toFixed(1)}%");
	$("#currentBetaUniques").text("${uniques}");
	`;
	console.log(js);

	var filename = "todaysBetaAdoption.js"
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
		cc.dailyActiveUsers(null, function(err, result){
			if (err) {
				callback(err);
			}
			var totalUniqueUsers = result.data.series[0].points[0];

			cc.dailyActiveUsers(appVersion, function(err, result){
				if (err) {
					callback(err);
				}

				var currentBetaUniqueUsers = result.data.series[0].points[0];
				var adoption = currentBetaUniqueUsers / totalUniqueUsers;

				Util.print(totalUniqueUsers);
				Util.print(currentBetaUniqueUsers);
				Util.print(adoption);

				callback(null, adoption, currentBetaUniqueUsers);
			});
		});
	});
};
