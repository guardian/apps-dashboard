var request = require('request');
var _ = require('lodash');

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

AppAnnieClient.prototype.getAppStoreReviewsForVersionWithRating = function init(version, rating, callback) {
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

var reviews = [];
AppAnnieClient.prototype.getAppStoreReviewsForVersion = function (version, pageNum, callback) {
	if(pageNum == 0)
		reviews = [];
	var options = {
		url: 'https://api.appannie.com/v1.2/apps/ios/app/' + module.iosProductID + '/reviews?page_index=' + pageNum + '&version=' + version,
		headers: {
			'Accept': 'application/json',
			'Authorization': module.auth
		}
	};
	var that = this;

	request(options, function(error, response, body) {
		if (error || response.statusCode != 200)
			callback(error);

		var result = JSON.parse(body);
		reviews = _.concat(reviews, result.reviews);
		if(result.next_page)
			that.getAppStoreReviewsForVersion(version, result.page_index + 1, callback)
		else
			callback(null, reviews);
	});
}

module.exports = AppAnnieClient;
