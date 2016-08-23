var moment = require ('moment');
var fs = require('fs');
var GuardianApp = require('../lib/GuardianApp.js');
var Util = require('../lib/Util.js');


var app = GuardianApp.getLatestAndroidBeta();
Util.print(app);
var js = `
//$('#appReleaseTimestamp').attr('data-livestamp', '${moment(app.releaseDate).unix()}');
$('#appVersion').text('${app.version}');
//$('#appReleaseDate').text('${Util.dayOfMonthAndWeek(app.releaseDate)}');
`;
console.log(js);

var filename = "betaVersion.js"
fs.writeFile(filename, js, function(err) {
	if(err) {
		throw err;
	}

	console.log(filename + " was saved!");
}); 


