var AppAnnieClient = require("../lib/AppAnnieClient.js")
var Util = require("../lib/Util.js")
var moment = require ('moment');
var nconf = require('nconf');
var fs = require('fs');

nconf.file({ file: '../config.json' });
var apikey = nconf.get("appannie_apikey");
var androidProductID = nconf.get("appannie_androidProductID");
var iosProductID = nconf.get("appannie_iosProductID");
console.log('apikey is ' + apikey);
console.log('androidProductID is ' + androidProductID);
console.log('iosProductID is ' + iosProductID);

generateText(function(err, rating) {
	if(err) {
		console.log(JSON.stringify(err.message))
		throw err;
	}

	var js = `$("#starRatingText").text("${rating.toFixed(2)}");`
	var filename = "starRating.js"
	console.log(js);
	fs.writeFile(filename, js, function(err) {
		if(err) {
			throw err;
		}

		console.log(filename + " was saved!");
	}); 
});
 
function generateText(callback) {
	var appAnnie = new AppAnnieClient(apikey, androidProductID, iosProductID);

	appAnnie.getGooglePlayReviews(Util.dates.twoWeeksAgoAndADay, Util.dates.yesterday, 0, function(err, result){
		if(err) callback(err);

		var averageStarRating = result.reduce(function(a,m,i,p) {
			return a + m.rating/p.length;
		},0);

		callback(null, averageStarRating);
	});
};
