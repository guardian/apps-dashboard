#!/usr/bin/env ruby
require 'spaceship'
require 'json'
Spaceship::Tunes.login

# Find guardian live app
app = Spaceship::Tunes::Application.find("uk.co.guardian.iphone2")

releases_json = {
	"production": {
		"bundleVersion": app.live_version.build_version, 
		"bundleShortVersion": app.live_version.version, 
		"version": "#{app.live_version.version} (#{app.live_version.build_version})",
		"releaseDate": "2017-10-23T11:00:00Z",
		"releaseDateUnix": 1508752800,
		"releaseDateHumanReadable": "Mon Oct 23rd"
	}
}

puts JSON.pretty_generate(releases_json)