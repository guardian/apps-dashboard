var apiURL = 'releases.json'

var demo = new Vue({

  el: '#dataZone',

  data: {
    releases: {production:{version:"?",releaseDateUnix:0,releaseDateHumanReadable:"?"},rollout:{version:"",releaseDateUnix:"",releaseDateHumanReadable:"",userFraction:""},"beta":{version:"?",releaseDateUnix:0,releaseDateHumanReadable:""},alpha:{version:"?",releaseDateUnix:0,releaseDateHumanReadable:"?"}}
  },

  created: function () {
    this.fetchData()
    setInterval(this.fetchData, 10000)
  },

  methods: {
    fetchData: function () {
      var xhr = new XMLHttpRequest()
      xhr.open('GET', apiURL)
      xhr.onload = () => {
	var response = JSON.parse(xhr.responseText)

	if(typeof response.rollout === "undefined")
		this.releases = response;
	else
		this.releases = Object.assign(this.releases, response)

	this.releases.production.daysAgo = moment.unix(this.releases.beta.releaseDateUnix).diff(moment.now(), 'days') * -1 + 1;
	this.releases.beta.daysAgo = moment.unix(this.releases.beta.releaseDateUnix).diff(moment.now(), 'days') * -1 + 1;
	this.releases.alpha.daysAgo = moment.unix(this.releases.alpha.releaseDateUnix).diff(moment.now(), 'days') * -1 + 1;

	console.log(this.releases);
      }
      xhr.send()
    }
  }
})
