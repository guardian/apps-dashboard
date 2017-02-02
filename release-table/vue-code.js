var apiURL = 'releases.json'

var demo = new Vue({

  el: '#dataZone',

  data: {
    releases: {production:{version:"?",releaseDateUnix:0,releaseDateHumanReadable:"?"},"beta":{version:"?",releaseDateUnix:0,releaseDateHumanReadable:""},alpha:{version:"?",releaseDateUnix:0,releaseDateHumanReadable:"?"}}
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
        this.releases = JSON.parse(xhr.responseText)
      }
      xhr.send()
    }
  }
})
