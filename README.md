node-red-node-feedparser-ext
============================

**This repository is a copy/forked from official Node-Red Feedparser**

<a href="https://github.com/node-red/node-red-nodes/tree/master/social/feedparser"></a>


Changes
-------

* Add Input parameter: allows to trigger externaly, and allows dynamic configuration
* Remove internal timer and matching option: lets input to trigger fetch, with allowing to variabilise the timers.


A <a href="http://nodered.org" target="_new">Node-RED</a> node to read RSS and Atom feeds.

Install
-------

Run the following command in your Node-RED user directory - typically `~/.node-red`

        npm install node-red-node-feedparser-ext

Usage
-----

### Input

Monitors an RSS/atom feed for new entries.

You can set the polling time in minutes. Defaults to 15 minutes.
