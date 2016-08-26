var AppAnnieClient = require("../lib/AppAnnieClient.js")
var Util = require("../lib/Util.js")
var _ = require("lodash");
var moment = require ('moment');
var nconf = require('nconf');
var fs = require('fs');

nconf.file({ file: '../config.json' });
var apikey = nconf.get("appannie_apikey");
var androidProductID = nconf.get("appannie_androidProductID");
var iosProductID = nconf.get("appannie_iosProductID");

generateText(function(err, numberOfComplaints, oneStarReviews, twoStarReviews) {
	if(err) {
		console.log(JSON.stringify(err.message))
		throw err;
	}

	if (numberOfComplaints <= 3) {
		var color = "green";
	} else if (numberOfComplaints <= 5) {
		var color = "amber";
	} else {
		var color = "red";
	}

	console.log(numberOfComplaints + " complaints today")
	var js = `
	$("#todaysNumberOfComplaints").text("${numberOfComplaints}");
	$("#todaysNumberOfComplaints").addClass("${color}");
	$("#todaysOneStarReviews").html(\`${oneStarReviews}\`);
	$("#todaysTwoStarReviews").html(\`${twoStarReviews}\`);
	`;
	console.log(js);

	var filename = "todaysNumberOfComplaints.js"
	fs.writeFile(filename, js, function(err) {
		if(err) {
			throw err;
		}

		console.log(filename + " was saved!");
	}); 
});

function generateCard(review) {
  var header = "Review";
  var title = review.title;
  var content = review.text;
  
  return `
    <div class="card card-outline-danger">
      <div class="card-header">${header}</div>
      <div class="card-block">
      <h4 class="card-title">${title}</h4>
      <p class="card-text">${content}</p>
      </div>
    </div>
    `;

}
 
function generateText(callback) {
	var appAnnie = new AppAnnieClient(apikey, androidProductID, iosProductID);

	appAnnie.getGooglePlayReviews(Util.dates.aDayAgo, Util.dates.today, [1,2], 0, function(err, reviews){
		if (err) {
			callback(err);
		}
		console.log(JSON.stringify(reviews));


                var oneStarReviews = reviews.filter(r => r.rating == 1);
                var twoStarReviews = reviews.filter(r => r.rating == 2);
                
                oneStarReviewsHtml = oneStarReviews.map(r => generateCard(r)).join("\n");
                twoStarReviewsHtml = twoStarReviews.map(r => generateCard(r)).join("\n");
                console.log(JSON.stringify(oneStarReviewsHtml));
                console.log(JSON.stringify(twoStarReviewsHtml));

		callback(null, reviews.length, oneStarReviewsHtml, twoStarReviewsHtml);
	});
};
