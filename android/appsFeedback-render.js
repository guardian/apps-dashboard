var GmailClient = require("./GmailClient.js")
var nconf = require('nconf');
var fs = require('fs');

nconf.file({ file: '../config.json' });
var user = nconf.get('gmail_user');
var password = nconf.get('gmail_password');

generateTable(function(err, table) {
	if(err) {
		throw err;
	}

	var js = '$("#appsFeedback").append(' + JSON.stringify(table) + ');'; 
	var filename = "appsFeedback.js"
	console.log(js);
	fs.writeFile(filename, js, function(err) {
		if(err) {
			throw err;
		}

		console.log(filename + " was saved!");
		// There's a bug in imap-simple on the node version I'm running, so this needs to be called manually
		process.exit(0);
	}); 
})
 
function generateTable(callback) {
	var gmailClient = new GmailClient(user, password);
	gmailClient.getEmailsForLabel("AppsFeedbackAndroid", function(err, emails){
		if (err) {
			callback(err);
		}
		
		console.log(JSON.stringify(emails))

		var rows = emails.map(function(email){
			return "<tr><td>" + email.body + "</td></tr>"
		}).join("");
		var table = "<tr><th>Apps Feedback Emails (" + emails.length + ")</th></tr>" + rows
		callback(null, table);
	});
};