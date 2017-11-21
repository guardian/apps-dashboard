#!/usr/bin/env ruby
require 'spaceship'
require 'json'
require 'open-uri'

Spaceship::Tunes.login

# Find guardian live app
app = Spaceship::Tunes::Application.find("uk.co.guardian.iphone2")

# GET guardian app app store listing in JSON
app_store_json = JSON.parse(open("https://itunes.apple.com/us/lookup?id=409128287").read)

releases_json = {
	"production": {
		"bundleVersion": app.live_version.build_version, 
		"bundleShortVersion": app.live_version.version, 
		"version": "#{app.live_version.version} (#{app.live_version.build_version})",
		"releaseDate": "#{app_store_json["results"][0]["currentVersionReleaseDate"]}",
		"releaseDateUnix": "#{Date.parse(app_store_json["results"][0]["currentVersionReleaseDate"]).to_time.to_i}",
		"releaseDateHumanReadable": "#{Date.parse(app_store_json["results"][0]["currentVersionReleaseDate"]).to_time.strftime("%a %b %d")}"
	}
}

puts JSON.pretty_generate(releases_json)
