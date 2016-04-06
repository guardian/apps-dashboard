var request = require('request');

function AppAnnieClient(apiKey, androidProductID, iosProductID) {
	module.auth = "Bearer " + apiKey;
	module.androidProductID = androidProductID;
	module.iosProductID = iosProductID
}

AppAnnieClient.prototype.getGooglePlayReviews = function init(startDate, endDate, rating, callback) {
	var options = {
		url: 'https://api.appannie.com/v1.2/apps/google-play/app/' + module.androidProductID + '/reviews?start_date=' + startDate + '&end_date=' + endDate + '&rating=' + rating,
		headers: {
			'Accept': 'application/json',
			'Authorization': module.auth
		}
	};

	request(options, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			callback(null, JSON.parse(body));
		} else {
			callback(error);
		}
	});
}

AppAnnieClient.prototype.getAppStoreReviewsForPeriod = function init(startDate, endDate, rating, callback) {
	var options = {
		url: 'https://api.appannie.com/v1.2/apps/ios/app/' + module.iosProductID + '/reviews?start_date=' + startDate + '&end_date=' + endDate + '&rating=' + rating,
		headers: {
			'Accept': 'application/json',
			'Authorization': module.auth
		}
	};

	request(options, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			callback(null, JSON.parse(body));
		} else {
			callback(error);
		}
	});
}

AppAnnieClient.prototype.getAppStoreReviewsForVersion = function init(version, rating, callback) {
	var options = {
		url: 'https://api.appannie.com/v1.2/apps/ios/app/' + module.iosProductID + '/reviews?rating=' + rating + '&version=' + version,
		headers: {
			'Accept': 'application/json',
			'Authorization': module.auth
		}
	};

	request(options, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			callback(null, JSON.parse(body));
		} else {
			callback(error);
		}
	});
}

module.exports = AppAnnieClient;
