var moment = require ('moment');
var fs = require('fs');
var GuardianApp = require('../lib/GuardianApp.js');
var Util = require('../lib/Util.js');


var app = GuardianApp.getLatestAndroidApp();
Util.print(app);

var js = `
$('#productionReleased').text('${improveReadability(moment(app.releaseDate).from(moment()))}');
$('#productionVersion').text('${app.version}');
$('#productionDate').text('${Util.dayOfMonthAndWeek(app.releaseDate)}');
`;
console.log(js);

var filename = "releaseTable.js"
fs.writeFile(filename, js, function(err) {
	if(err) {
		throw err;
	}

	console.log(filename + " was saved!");
}); 

function improveReadability(str) {
	if(str === "a day ago")
		return "Yesterday";
	return str;
}
