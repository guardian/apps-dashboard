var apiURL = 'https://s3-eu-west-1.amazonaws.com/static-content-dist/android/releases.json'
var iOSReleasesURL = 'https://s3-eu-west-1.amazonaws.com/static-content-dist/ios/releases.json'

// This ugly code comes from http://stackoverflow.com/questions/28425132/how-to-calculate-number-of-working-days-between-two-dates-in-javascript-using
function workday_count(start,end) {
  var first = start.clone().endOf('week'); // end of first week
  var last = end.clone().startOf('week'); // start of last week
  var days = last.diff(first,'days') * 5 / 7; // this will always multiply of 7
  var wfirst = first.day() - start.day(); // check first week
  if(start.day() == 0) --wfirst; // -1 if start with sunday
  var wlast = end.day() - last.day(); // check last week
  if(end.day() == 6) --wlast; // -1 if end with saturday
  return wfirst + days + wlast; // get the total
}

function numberOfWorkingDaysBetween(start, end) {
  return Math.floor(workday_count(start, end)) - 1;
}

function numberOfWorkingDaysMessage(days) {
  if (days < 1) {
    return "today";
  }  else if( days == 1) {
    return `${days} working day ago`;
  } else {
    return `${days} working days ago`;
  }
}

var demo = new Vue({

  el: '#dataZone',

  data: {
    releases: {production:{version:"?",releaseDateUnix:0,releaseDateHumanReadable:"?"},rollout:{version:"",releaseDateUnix:"",releaseDateHumanReadable:"",userFraction:""},"beta":{version:"?",releaseDateUnix:0,releaseDateHumanReadable:""},alpha:{version:"?",releaseDateUnix:0,releaseDateHumanReadable:"?"}},
    iOSReleases: {production:{bundleShortVersion:"?",releaseDateUnix:0,releaseDateHumanReadable:"?"}},
  },

  created: function () {
    this.fetchData()
    setInterval(this.fetchData, 10000)
  },

  methods: {
    fetchData: function () {
      $.get(apiURL, data => {
	this.releases = Object.assign(this.releases, data)

	this.releases.production.daysAgo = moment.unix(this.releases.production.releaseDateUnix).diff(moment.now(), 'days') * -1 + 1;
	this.releases.beta.daysAgo = moment.unix(this.releases.beta.releaseDateUnix).diff(moment.now(), 'days') * -1 + 1;
	this.releases.alpha.daysAgo = moment.unix(this.releases.alpha.releaseDateUnix).diff(moment.now(), 'days') * -1 + 1;

	this.releases.production.workingDaysAgo = numberOfWorkingDaysBetween(moment.unix(this.releases.production.releaseDateUnix), moment());
	this.releases.beta.workingDaysAgo = numberOfWorkingDaysBetween(moment.unix(this.releases.beta.releaseDateUnix), moment());
	this.releases.alpha.workingDaysAgo = numberOfWorkingDaysBetween(moment.unix(this.releases.alpha.releaseDateUnix), moment());

	this.releases.production.workingDaysAgoMessage = numberOfWorkingDaysMessage(this.releases.production.workingDaysAgo);
	this.releases.beta.workingDaysAgoMessage = numberOfWorkingDaysMessage(this.releases.beta.workingDaysAgo);
	this.releases.alpha.workingDaysAgoMessage = numberOfWorkingDaysMessage(this.releases.alpha.workingDaysAgo);

	console.log(this.releases);

      })

      $.get(iOSReleasesURL, data => {
	this.iOSReleases = Object.assign(this.iOSReleases, data)
	console.log(this.iOSReleases);
      })
    }
  }
})
