var moment = require ('moment');
var fs = require('fs');
var GuardianApp = require('../lib/GuardianApp.js');
var Util = require('../lib/Util.js');


var app = GuardianApp.getLatestiOSApp();
Util.print(app);
var js = `
$('#appReleaseTimestamp').attr('data-livestamp', '${moment(app.releaseDate).unix()}');
$('#appVersion').text('${app.version}');
$('#appReleaseDate').text('${Util.dayOfMonthAndWeek(app.releaseDate)}');
`;
console.log(js);

var filename = "appVersion.js"
fs.writeFile(filename, js, function(err) {
	if(err) {
		throw err;
	}

	console.log(filename + " was saved!");
	// Need to exit process manually for reasons I don't quite understand
	process.exit(0);
}); 
