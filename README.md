node-red-contrib-feedparser-ext
============================

**This repository is a copy/forked from official Node-Red Feedparser**

Source: <a href="https://github.com/node-red/node-red-nodes/tree/master/social/feedparser">Original Node-Red FeedParser</a>

Content
-------

A <a href="http://nodered.org" target="_new">Node-RED</a> node to read RSS and Atom feeds.

Changes
-------

* Add Input parameter: allows to trigger externaly, and allows dynamic configuration
* Remove internal timer and matching option: 
This lets input node to trigger fetch, which enables use case like scheduling instead of fixed poll interval.
* Fix the never cleaned-up *seen* variable: the json object used internally to flag seen article was growing indefinitly with accumulating days of article in memory
* Allows to customize *url* of RSS feed by parameter *payload*
This permits to source a list of URLs from external content, therefore allowing for example a Personal Assistant module to add/remove URLs dynamicaly.

Install
-------

Run the following command in your Node-RED user directory - typically `~/.node-red`

        npm install node-red-contrib-feedparser-ext

Usage
-----

Triggers a request to fetch an RSS/atom feed for new entries.

You can trigger using an Input parameter at regular or dynamic interval.

Parameter *payload* can be specified as URL of RSS Feed, or if not specified, configuration option is used.
