var moment = require ('moment');
var fs = require('fs');

var js = "$('#realTimeTimestamp').attr('data-livestamp', '" + moment().unix() + "');";
console.log(js);

var filename = "realTimeTimestamp.js"
fs.writeFile(filename, js, function(err) {
	if(err) {
		throw err;
	}

	console.log(filename + " was saved!");
}); 


