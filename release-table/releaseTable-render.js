var moment = require ('moment');
var fs = require('fs');
var GuardianApp = require('../lib/GuardianApp.js');
var Util = require('../lib/Util.js');


var app = GuardianApp.getLatestAndroidApp();
var beta = GuardianApp.getLatestAndroidBetaAsync();
var alpha = GuardianApp.getLatestAndroidAlphaAsync();
Util.print(app);
Util.print(beta);
Util.print(alpha);

var js = `
$('#productionReleased').text('${improveReadability(moment(app.releaseDate).from(moment()))}');
$('#productionVersion').text('${app.version}');
$('#productionDate').text('${Util.dayOfMonthAndWeek(app.releaseDate)}');

$('#betaReleased').text('${improveReadability(moment(beta.releaseDate).from(moment()))}');
$('#betaVersion').text('${beta.version}');
$('#betaDate').text('${Util.dayOfMonthAndWeek(beta.releaseDate)}');

$('#alphaReleased').text('${improveReadability(moment(alpha.releaseDate).from(moment()))}');
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