var apiURL = 'releases.json'

var demo = new Vue({

  el: '#dataZone',

  data: {
    releases: null
  },

  created: function () {
    this.fetchData()
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
