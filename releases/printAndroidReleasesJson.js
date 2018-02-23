var moment = require ('moment');
var _ = require('lodash');
var GuardianApp = require('../lib/GuardianApp.js');

var tracks = GuardianApp.getLatestGooglePlayReleases((err, releases) => {
	var releasesExtendedDates = _.mapValues(releases, r => Object.assign(r, {
		"releaseDateUnix": moment(r.releaseDate).unix(),
		"releaseDateHumanReadable": moment(r.releaseDate).format('ddd MMM Do')}
		));
	if(releasesExtendedDates["rollout"] == undefined)
		releasesExtendedDates["rollout"] = {version:"",releaseDateUnix:"",releaseDateHumanReadable:"",userFraction:""};
	console.log(JSON.stringify(releasesExtendedDates, null, "  "));
});
