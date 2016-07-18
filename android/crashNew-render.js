var CrittercismClient = require('../lib/CrittercismClient.js');
var Util = require('../lib/Util.js');
var moment = require ('moment');
var _ = require ('lodash');
var nconf = require('nconf');
var fs = require('fs');
var GuardianApp = require('../lib/GuardianApp.js');
var sleep = require('sleep');
var async = require('async');

nconf.file({ file: '../config.json' });
var username = nconf.get('crittercism_username');
var password = nconf.get('crittercism_password');
var clientid = nconf.get('crittercism_clientid');
console.log('username is ' + username);
console.log('clientid is ' + clientid);

function crashAsHtml(c){
	return `<a href='https://app.crittercism.com/developers/crash-details/5457bc14d478bc2b14000002/${c.hash}' target='_blank'>${c.name}</a><BR>${Util.abreviated(c.reason)}<BR>${c.uniqueSessionCount} users, ${c.sessionCount} crashes<BR><BR>`;
}

function lastWord(str) {
	var breakdown = str.split(".");
	return breakdown.pop();
}

function versionsAsLabels(versions) {
	return versions.map(v => `<span class="label label-danger">${v}</span> `).join("");
}

function osAsLabels(os) {
	return os.map(v => `<span class="label label-primary">${v}</span> `).join("");
}

function modelsAsLabels(models) {
	return models.map(v => `<span class="label label-success">${v}</span> `).join("");
}

function breadcrumbAverageAsLabel(num) {
	return `<span class="label label-warning">${num}</span>`
}

function sanitize(str) {
	if(str)
		return str.replace(/`/g, '');
	else
		return "";
}

function importance(c) {
	return Math.sqrt(Math.pow(c.uniqueSessionCount, 2) + Math.pow(c.sessionCount, 2) + Math.pow(c.totalSessionCount, 2))
}

function generateCards(crashes) {
	return crashes.map(c => {
		var versionLabels = versionsAsLabels(c.versions);
		var osLabels = osAsLabels(c.majorAndroidVersions);
		var modelLabels = modelsAsLabels(c.manufacturers);
		var breadcrumLabel = breadcrumbAverageAsLabel(c.averageNumberOfBreadcrumbs);
		var title = lastWord(sanitize(c.name));
		var text = `${sanitize(c.reason)}<BR>${Util.abreviated(sanitize(c.suspectLine), 35)}`;
		var link = `https://app.crittercism.com/developers/crash-details/555484008172e25e67906d29/${c.hash}`;
		var users = c.uniqueSessionCount;
		var crashes = c.sessionCount;
		var allTimeCrashes = c.totalSessionCount;
		return `
	<div class="col-sm-4">
		<div class="card"> 
			<div class="card-header"> 
				${versionLabels}
				${osLabels}
				${modelLabels}
				${breadcrumLabel}
			</div> 
			<div class="card-block"> 
				<h4 class="card-title">${title}</h4> 
				<p class="card-text">${text}</p> 
				Current version: <a href="${link}" class="card-link">${users} users, ${crashes} crashes</a><BR>
				All time: <a href="${link}" class="card-link">${allTimeCrashes} crashes</a> 
			</div> 
		</div>
	</div>
	`;
	}).join("\n");
}

function generateHtmlCards(crashes) {
	var chunks = _.chunk(crashes, 3);
	var strings = chunks.map(chunk => {
		return `<div class="row">${generateCards(chunk)}</div>`
	});
	console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
	console.log(strings);

	return strings.join("\n");
}

generateText(function(err, appVersion, majorVersion, newCrashes, existingCrashes) {
	if(err) {
		console.log(JSON.stringify(err.message))
		throw err;
	}

	var js = `
$("#newCrashes").html(\`${generateHtmlCards(newCrashes)}\`);
$("#existingCrashes").html(\`${generateHtmlCards(existingCrashes)}\`);
	`;

	var filename = "newCrashes.js"
	console.log(js);
	fs.writeFile(filename, js, function(err) {
		if(err) {
			throw err;
		}

		console.log(filename + " was saved!");
	}); 
});

function manufacturerListFromModels(models) {
	var manufacturers =  models.map(m => {
		if(m.startsWith("SM") || m.startsWith("GT") || m.startsWith("SAMSUNG") || m.startsWith("SPH") || m.startsWith("SGH"))
			return "Samsung"
		else if(m.startsWith("Nexus"))
			return "Nexus"
		else if(m.startsWith("Wileyfox Storm"))
			return "Amazon"
		else if(m.startsWith("D") || m.startsWith("E") || m.startsWith("Xperia") || m.startsWith("C"))
			return "Sony"
		else if(m.startsWith("XT") || m.startsWith("Moto"))
			return "Motorola"
		else if(m.startsWith("LG"))
			return "LG"
		else if(m.startsWith("HTC"))
			return "HTC"
		else if(m.startsWith("HP"))
			return "HP"
		else
			return m;
	});
	return _.uniq(manufacturers);
}

function averageOfIntArray(arr) {
	var sum = arr.reduce(function(a, b) { return a + b; });
	var avg = sum / arr.length;
	return Math.round(avg);
}
 
function generateText(callback) {
	var appVersion = "4.6.733"
	var majorVersion = "4.6"
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

			function wrapper(c,cb) {
				console.log(c.name);
				console.log(c.reason);
				console.log(c.suspectLine);
				cc.getCrashDetails(c.hash,function(err, result){
					if(err) cb(err);
					if(!result) {
						console.log("result came back as " +result);
						console.log("why?!");
						process.exit(1);
					}
					c["versions"] = Object.keys(result.sessionCountsByVersion);
					c["os"] = result.diagnostics.discrete_diagnostic_data.system_version.map(v => v[0]);
					c["majorAndroidVersions"] = _.uniq(c.os.map(v => "A" + v.substring(1, 9)));
					c["models"] = result.diagnostics.discrete_diagnostic_data.model.map(m => m[0]);
					c["totalSessionCount"] = Object.keys(result.sessionCountsByVersion).reduce((sum, k) => sum + result.sessionCountsByVersion[k], 0);
					c["averageNumberOfBreadcrumbs"] = averageOfIntArray(result.breadcrumbTraces.map(b => b.parsedBreadcrumbs.length));
					console.log("> " + c.versions.join(" "));
					console.log("> " + c.os.join(" "));
					console.log("> " + c.totalSessionCount);
					console.log("> " + c.averageNumberOfBreadcrumbs);
					console.log("*****************************************************");
					//sleep.sleep(30);
					cb(null, c);
				});
			}
			

			async.mapSeries(crashes, wrapper, function(err, crashesWithVersions) {
				if(err) callback(err);

				Util.print(crashesWithVersions);
				crashesWithVersions = crashesWithVersions.sort((b,a) => importance(a) - importance(b));

				crashesWithVersions = mergeThem(crashesWithVersions)			
				crashesWithVersions = crashesWithVersions.map(c => {
					c["manufacturers"] = manufacturerListFromModels(c.models);
					console.log(JSON.stringify(c.models) + "==>" + JSON.stringify(c["manufacturers"]))
					return c;
				});

				//crashesWithVersions = crashesWithVersions.filter(c => c.sessionCount > 1 && c.uniqueSessionCount > 1)
	
				var newCrashes = crashesWithVersions.filter(c => c.versions.length == 1);
				console.log("New in " + appVersion);
				Util.print(newCrashes);
			
				//var newMajorVersionCrashes = crashesWithVersions.filter(c => { 
				//	var versionsInterested = c.versions.filter(v => v.indexOf(majorVersion) > -1);
				//	return versionsInterested.length == c.versions.length;
				//});
				//console.log("New in " + majorVersion);
				//Util.print(newMajorVersionCrashes);
				var existingCrashes = crashesWithVersions.filter(c => c.versions.length != 1);
				console.log("Rest");
				Util.print(existingCrashes);
				
				

				callback(null, appVersion, majorVersion, newCrashes, existingCrashes);
			});

		});
	});
};

function mergeThem(crashes) {
	function findMergedCrash(crash) {
		var filtered = merged.filter(c => ( c.name === crash.name && 
		                                    c.reason === crash.reason)
		                                  ) || 
		                                  ( c.name === crash.name && 
		                                    c.suspectLine === crash.suspectLine
		                                  );
		return filtered[0]; //dodg
	}

	var merged = [];

	crashes.forEach(crash => {
		if(mergedCrash = findMergedCrash(crash)) {
			mergedCrash.sessionCount += crash.sessionCount;
			mergedCrash.uniqueSessionCount += crash.uniqueSessionCount;
			mergedCrash.versions = _.uniq(mergedCrash.versions.concat(crash.versions));
			mergedCrash.os = mergedCrash.os.concat(crash.os);
			mergedCrash.majorAndroidVersions = _.uniq(mergedCrash.majorAndroidVersions.concat(crash.majorAndroidVersions));
			mergedCrash.models = mergedCrash.models.concat(crash.models);
			mergedCrash.totalSessionCount += crash.totalSessionCount;
			mergedCrash.averageNumberOfBreadcrumbs = Math.min(mergedCrash.averageNumberOfBreadcrumbs, crash.averageNumberOfBreadcrumbs);
		}
		else {
			merged.push(crash)
		}
	});

	return merged.sort( (a,b) => importance(b) - importance(a) );
}

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
