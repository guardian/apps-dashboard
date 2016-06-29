var request = require('request');
var _ = require('lodash');

function AppAnnieClient(apiKey, androidProductID, iosProductID) {
	module.auth = "Bearer " + apiKey;
	module.androidProductID = androidProductID;
	module.iosProductID = iosProductID
}


AppAnnieClient.prototype.getLatestiOSAppVersion = function (callback) {
	var url = "https://api.appannie.com/v1.2/apps/google-play/app/" + module.androidProductID + "/details";
	callAPI(url, function(err, result){
		callback(err, result.product.current_version)
	});
}

AppAnnieClient.prototype.getGooglePlayStarRating = function (callback) {
	var url = 'https://api.appannie.com/v1.2/apps/google-play/app/' + module.androidProductID + '/ratings?page_index=0';
	callAPI(url, function(err, result){
		callback(err, result.ratings[0].all_ratings.average);
	});
}

	var reviews = [];
AppAnnieClient.prototype.getGooglePlayReviews = function (startDate, endDate, ratings, pageIndex, callback) {
	var url = 'https://api.appannie.com/v1.2/apps/google-play/app/' + module.androidProductID + '/reviews?start_date=' + startDate + '&end_date=' + endDate + '&rating=' + ratings.join('%2B') + '&page_index=' + pageIndex;

	callAPI(url, (err, result) => {
		reviews = _.concat(reviews, result.reviews);
		if (result.next_page)
			this.getGooglePlayReviews(startDate, endDate, ratings, result.page_index + 1, callback)
		else
			callback(null, reviews);
	});
}

AppAnnieClient.prototype.getAppStoreReviewsForPeriod = function (startDate, endDate, rating, callback) {
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

AppAnnieClient.prototype.getAppStoreReviewsForVersionWithRating = function (version, rating, callback) {
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

function callAPI(url, callback) {
	var options = {
		url: url,
		headers: {
			'Accept': 'application/json',
			'Authorization': module.auth
		}
	};

	request(options, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			callback(null, JSON.parse(body));
		} else {
			if(error)
				callback(error);
			else
				callback(new Error(JSON.parse(body).code + ": " + JSON.parse(body).error));
		}
	});
}

module.exports = AppAnnieClient;
