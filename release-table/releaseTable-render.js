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
$('#productionDate').attr('data-livestamp','${moment(app.releaseDate).unix()}');

$('#betaReleased').text('${improveReadability(moment(beta.releaseDate).from(moment()))}');
$('#betaVersion').text('${beta.version}');
$('#betaDate')..attr('data-livestamp','${moment(beta.releaseDate).unix()}');

$('#alphaReleased').text('${improveReadability(moment(alpha.releaseDate).from(moment()))}');
$('#alphaVersion').text('${alpha.version}');
$('#alphaDate')..attr('data-livestamp','${moment(alpha.releaseDate).unix()}');

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
