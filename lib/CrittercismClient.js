// Crittercism Client DTO
// Created by Martin Stone <martin@crittercism.com>
//
// Provides the following methods:
//
// init - connect to Crittercism and obtain a bearer token for subsequent requests
// apps - get info about all apps visible to your Crittercism ID
// performancePie - get data from /performanceManagement/pie endpoint
// errorPie - get data from /errorMonitoring/pie endpoint
// errorGraph - get data from /errorMonitoring/pie endpoint
// liveStatsTotals & liveStatsPeriodic - get data from /liveStats endpoints
//
// Please see http://docs.crittercism.com/api/api.html for detailed information
// about the Crittercism REST API.
//
var https = require('https');

function CrittercismClient(clientID, appId) {
	module.hostname = 'developers.crittercism.com';
	module.port = 443;
	module.clientID = clientID;
	module.appId = appId;
}

CrittercismClient.prototype.init = function init(user, pass, callback) {
	module.user = user;
	module.pass = pass;

	var path = '/v1.0/token' + '?grant_type=password&username=' + module.user + '&password=' + module.pass;

	this.clientPost(path, null, function(err, data) {
		if (err) {
			callback(err);
			return;
		} else {
			module.token = data.access_token;
			module.tokenStr = 'Bearer ' + module.token;
			callback(null);
		}
	});
}

CrittercismClient.prototype.apps = function apps(callback) {
	var params = [
		'appName',
		'appType',
		'appVersions',
		'crashPercent',
		'dau',
		'latency',
		'latestAppStoreReleaseDate',
		'latestVersionString',
		'linkToAppStore',
		'iconURL',
		'mau',
		'rating',
		'role'
	];

	var path = '/v1.0/apps?attributes=' + params.join('%2C');

	this.clientGet(path, callback);
}

CrittercismClient.prototype.urlForCrash = function (hash) {
	return 'https://app.crittercism.com/developers/crash-details/' + module.appId + '/' + hash;
}

CrittercismClient.prototype.topCrashByUser = function(appVersion, callback) {
	var path = '/v2/app/' + module.appId + '/crash/summaries?status=unresolved&sortBy=uniqueSessionCount&sortOrder=desc&appVersion=' + appVersion;

	this.clientGet(path, (err, result) => callback(err, result.data));
}

CrittercismClient.prototype.getCrashDetails = function(hash, callback) {
	var path = '/v1.0/crash/' + hash;

	this.clientGet(path, callback);
}

CrittercismClient.prototype.performancePie = function performancePie(appIds, graph, duration, filter, groupBy, callback) {

	var path = '/v1.0/performanceManagement/pie';

	var params = {'params': 
		{
			appIds: appIds,
			graph: graph,
			duration: duration,
			groupBy: groupBy
		}
	};

	if ( filter != null ) params.filters = filter;

	this.clientPost(path, params, callback);
}

CrittercismClient.prototype.errorPie = function errorPie(appIds, graph, duration, filter, groupBy, callback) {

	var path = '/v1.0/errorMonitoring/pie';

	var params = {'params': 
		{
			appIds: appIds,
			graph: graph,
			duration: duration,
			groupBy: groupBy
		}
	};

	if ( filter != null ) params.filters = filter;

	this.clientPost(path, params, callback);
}

CrittercismClient.prototype.errorSparklines = function errorSparklines(appIds, graph, duration, filter, groupBy, callback) {

	var path = '/v1.0/errorMonitoring/sparklines';

	var params = {'params': 
		{
			appIds: appIds,
			graph: graph,
			duration: duration,
			groupBy: groupBy
		}
	};

	if ( filter != null ) params.filters = filter;

	this.clientPost(path, params, callback);
}

CrittercismClient.prototype.trends = function (startDate, callback) {
	//var path = '/v1.0/' + module.appId + '/trends?maxKeys=5&startDateInclusive=2016-08-24T00:00:00';
	var path = '/v1.0/' + module.appId + '/trends?maxKeys=5&startDateInclusive=' + startDate;

	this.clientGet(path, callback);
}

CrittercismClient.prototype.dailyActiveUsers = function (appVersion, callback) {
	var filter = null;
	if(appVersion)
		filter = {"appVersion": appVersion};

	this.errorGraph([module.appId], "dau", 1440, filter, callback);
}

CrittercismClient.prototype.dailyCrashRate = function (appVersion, start, end, callback) {
	var path = '/v1.0/errorMonitoring/graph';

	var params = {'params': 
		{
			appId: module.appId,
			graph: "crashPercent",
			start: start,
			end: end
		}
	};

	var filter = null;
	if(appVersion)
		params.params["filters"] = {"appVersion": appVersion};

	this.clientPost(path, params, callback);
}

CrittercismClient.prototype.errorGraph = function errorGraph(appIds, graph, duration, filter, callback) {
	var path = '/v1.0/errorMonitoring/graph';

	var params = {'params': 
		{
			appIds: appIds,
			graph: graph,
			duration: duration
		}
	};

	if ( filter != null ) params.params["filters"] = filter;

	this.clientPost(path, params, callback);
}

CrittercismClient.prototype.liveStatsTotals = function liveStatsTotals(appId, appVersion, callback) {
	var version = appVersion ? appVersion : 'total';
	var path = '/v1.0/liveStats/totals/' + appId + '?app_version=' + version;

	this.clientPost(path, null, callback);
}

CrittercismClient.prototype.liveStatsPeriodic = function liveStatsPeriodic(appId, appVersion, initialize, callback) {
	var version = appVersion ? appVersion : 'total';
	var path = '/v1.0/liveStats/periodic/' + appId + '?app_version=' + version;
	if ( initialize ) {
		path += '&initialize=1';
	}

	this.clientPost(path, null, callback);
}

////////////////////////////////
//
// HTTPS client functions
//
CrittercismClient.prototype.clientGet = function clientGet(url, callback) {
	this.clientRequest('GET', url, null, callback);
}

CrittercismClient.prototype.clientPost = function clientPost(url, params, callback) {
	this.clientRequest('POST', url, params, callback);
}

CrittercismClient.prototype.clientRequest = function clientRequest(method, url, params, callback) {
	var options = {
		hostname: module.hostname,
		port: module.port,
		method: method,
		path: url,
		auth: module.clientID + ':ANYTHING',
		headers: {
			'Content-type': 'application/json'
		}
	};
	if(module.tokenStr) {
		options.headers['Authorization'] = module.tokenStr;
	}

	if ( module.debug ) {
		console.log('clientRequest ' + method + ' ' + url);
	}

	var req = https.request(options, function(res) {
		var buffer = '';
		var failed = false;

		if ( res.statusCode < 200 || res.statusCode > 204 ) failed = true;

	  res.setEncoding('utf8');
	  res.on('data', function (chunk) {
	    buffer += chunk;
		}).on('end', function() {
			if (failed) {
				callback(new Error(res.statusCode));
				return;
			}
			var o;
			try {
				o = JSON.parse(buffer);
			} catch(e) {
				e.statusCode = e.code;
				e.error_description = e.message;
				callback(e);
			}

			callback(null, o);
		});
	});
	if (params != null) {
		if ( module.debug ) {
			console.log(JSON.stringify(params, null, '  '));
		}
		req.write(JSON.stringify(params));
	}
	req.end();
	req.on('error', function(e) {
		e.statusCode = e.code;
		e.error_description = e.message;
		callback(e);
	});
}

CrittercismClient.prototype.sortCrashes = function(crashes) {
	function importance(c) {
		return Math.sqrt(Math.pow(c.uniqueSessionCount, 2) + Math.pow(c.sessionCount, 2) + Math.pow(c.totalSessionCount, 2))
	}

	return crashes.sort( (a,b) => importance(b) - importance(a) );
}

CrittercismClient.prototype.merge = function (crashes, /* optional */ mergeExtraFields) {
	function findCrashInArray(crash, arr) {
		var filtered = arr.filter(c => ( c.name === crash.name && 
		                                    c.reason === crash.reason)
		                                  ) || 
		                                  ( c.name === crash.name && 
		                                    c.suspectLine === crash.suspectLine
		                                  );
		return filtered[0]; //dodg
	}

	var merged = [];

	crashes.forEach(crash => {
		if(mergedCrash = findCrashInArray(crash, merged)) {
			mergedCrash.sessionCount += crash.sessionCount;
			mergedCrash.uniqueSessionCount += crash.uniqueSessionCount;
			mergedCrash.totalSessionCount += crash.totalSessionCount;
			if(typeof mergeExtraFields == 'function')
				mergeExtraFields(mergedCrash, crash);
		}
		else {
			merged.push(crash)
		}
	});

	return merged;
}

module.exports = CrittercismClient;
