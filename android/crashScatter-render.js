var CrittercismClient = require('../lib/CrittercismClient.js');
var Util = require('../lib/Util.js');
var moment = require ('moment');
var _ = require ('lodash');
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

	var js = `
	new Highcharts.Chart(${Util.stringify(chart)});
	`;
	console.log(js);

	var filename = chart.chart.renderTo + ".js"
	fs.writeFile(filename, js, function(err) {
		if(err) {
			throw err;
		}

		console.log(filename + " was saved!");
	}); 
});
 
function generateChart(callback) {
        var chart = Util.getTemplate("polygon");
	var appVersion = GuardianApp.getLatestAndroidAppVersion();
	var cc = new CrittercismClient(clientid);

	cc.init(username, password, function(err) {
		if (err) {
			callback(err);
		}

		console.log('Crittercism API client initialized');
		cc.topCrashByUser(appVersion, function(err, crashes){
			if (err) {
				callback(err);
			}

			console.log(JSON.stringify(crashes));
			var maxUsers = Math.max.apply(Math, crashes.map(c => c.uniqueSessionCount)) + 5;
			var maxOccurrences = Math.max.apply(Math, crashes.map(c => c.sessionCount)) + 5;

			chart.chart.renderTo = "crashScatter";
			chart.title.text = "Occurrences VS Users affected";
			chart.subtitle.text = "";
			chart.xAxis.title.text = "Users affected";
			chart.yAxis.title.text = "Occurrences";
			chart.series[0].name = "Danger zone";
			chart.series[0].data = [[40, 40], [40, maxOccurrences], [maxUsers,maxOccurrences], [maxUsers, 40]];
			chart.series[1].name = "Crashes";
			chart.series[1].data = crashes.map(function(c){ return {x:c.uniqueSessionCount, y:c.sessionCount, name:c.name, hash:c.hash, reason:Util.abreviated(c.reason)}});
			chart.tooltip.headerFormat = "{point.x} users, {point.y} crashes<br>";
			chart.tooltip["useHTML"] = true;
			chart.tooltip.pointFormat = "<b><a href='https://app.crittercism.com/developers/crash-details/5457bc14d478bc2b14000002/b07f10524d26853c' target='_blank'>{point.name}</a></b><br>{point.reason}";

			callback(null, chart);
		});
	});
};

function generateVersionSummary(system_version, app_version) {
	var androidVersion = crashOSVersionSummary(system_version)
	var appVersion = crashAppVersionSummary(app_version)
	Util.print(androidVersion);
	Util.print(appVersion);
	if(appVersion === "" && androidVersion === "")
		return ""
	else if (appVersion != "" && androidVersion != "")
		return `Exclusive to <b>${appVersion}</b> and <b>${androidVersion}</b>.`
	else if (appVersion != "" && androidVersion === "")
		return `Exclusive to <b>${appVersion}</b>.`
	else if (appVersion === "" && androidVersion !== "")
		return `Exclusive to <b>${androidVersion}</b>.`

}

function crashOSVersionSummary(os) {
	var versions = os.map(a => a[0]);
	var majorVersions = _.uniq(versions.map(a => a.slice(0,9)));

	if(majorVersions.length == 1)
		return majorVersions[0].charAt(0).toUpperCase() + majorVersions[0].slice(1);
	else
		return "";
}

function crashAppVersionSummary(app) {
	var versions = app.map(a => a[0]);

	if(versions.length == 1)
		return versions[0];
	else
		return "";
}

function mostWidespreadCrash(crashes) {
	return crashes.sort((b,a) => a.uniqueSessionCount - b.uniqueSessionCount)[0];
}

function mostFrequentCrash(crashes) {
	return crashes.sort((b,a) => a.sessionCount - b.sessionCount)[0];
}

function calculateHistogramFor(crashes) {
	var histogram = {}
	crashes.forEach(crash => {
		if(typeof histogram[crash.name] === "undefined")
			histogram[crash.name] = crash.sessionCount;
		else
			histogram[crash.name] += crash.sessionCount;
	})
	var sortedKeys = Object.keys(histogram).sort( (a,b) => histogram[b] - histogram[a] );
	sortedHistogram = {};
	sortedKeys.forEach(key => sortedHistogram[key] = histogram[key]);
	return sortedHistogram;
}
