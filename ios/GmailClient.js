var imaps = require('imap-simple');

function GmailClient(user, password) {
	module.config = {
		imap: {
			user: user,
			password: password,
			host: 'imap.gmail.com',
			port: 993,
			tls: true,
			authTimeout: 3000
		}
	};
}

GmailClient.prototype.getEmailsForLabel = function (label, callback) {

	var conn = {};

	imaps.connect(module.config, function(err, connection) {
		if(err) callback(err);
		conn = connection;

		conn.openBox(label, function(err){
			if(err) callback(err);
			var searchCriteria = ['ALL'];
			var fetchOptions = {
				bodies: ['TEXT'],
				markSeen: false
			};

			conn.search(searchCriteria, fetchOptions, function(err, results){
				if(err) callback(err);

				var emails = results.map(function (result) {
					var sanitizedBody = result.parts[0].body.replace(/\r\n/g, "\n");
					var date = result.attributes.date;
					return {date: date, body: sanitizedBody }
				});

				callback(null, emails);
			});
		});
	});
}

module.exports = GmailClient;
