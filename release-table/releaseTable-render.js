var moment = require ('moment');
var fs = require('fs');
var GuardianApp = require('../lib/GuardianApp.js');
var Util = require('../lib/Util.js');


var app = GuardianApp.getLatestAndroidApp();
var beta = GuardianApp.getLatestAndroidBetaAsync();
var alpha = GuardianApp.getLatestAndroidAlphaAsync();

var js = `
$('#productionReleased').attr('data-livestamp','${moment(app.releaseDate).unix() + 21600}');
$('#productionVersion').text('${app.version}');
$('#productionDate').text('${Util.dayOfMonthAndWeek(app.releaseDate)}');

$('#betaReleased').attr('data-livestamp','${moment(beta.releaseDate).unix()}');
$('#betaVersion').text('${beta.version}');
$('#betaDate').text('${Util.dayOfMonthAndWeek(beta.releaseDate)}');

$('#alphaReleased').attr('data-livestamp','${moment(alpha.releaseDate).unix()}');
$('#alphaVersion').text('${alpha.version}');
$('#alphaDate').text('${Util.dayOfMonthAndWeek(alpha.releaseDate)}');

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
