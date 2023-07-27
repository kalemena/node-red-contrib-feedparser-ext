
module.exports = function(RED) {
    "use strict";
    var FeedParser = require("feedparser");
    var request = require("request");
    var url = require('url');

    function FeedParseNode(n) {
        RED.nodes.createNode(this,n);
        this.url = n.url;
        // if (n.interval > 35790) { this.warn(RED._("feedparse-ext.errors.invalidinterval")) }
        // this.interval = (parseInt(n.interval)||15) * 60000;
        // this.interval_id = null;
        this.ignorefirst = n.ignorefirst || false;
        this.seen = {};
        this.seenCycle = [];
        this.donefirst = false;
        var node = this;
        var parsedUrl = url.parse(this.url);
        if (!(parsedUrl.host || (parsedUrl.hostname && parsedUrl.port)) && !parsedUrl.isUnix) {
            node.error(RED._("feedparse-ext.errors.invalidurl"),RED._("feedparse-ext.errors.invalidurl"));
        }
        else {
            var getFeed = function() {
                var req = request(node.url, {timeout:10000, pool:false});
                //req.setMaxListeners(50);
                req.setHeader('user-agent', 'Mozilla/5.0 (Node-RED)');
                req.setHeader('accept', 'application/rss+xml,text/html,application/xhtml+xml,application/xml');

                var feedparser = new FeedParser();
                node.seenCycle = []

                req.on('error', function(err) { node.error(err); });

                req.on('response', function(res) {
                    if (res.statusCode != 200) { node.warn(RED._("feedparse-ext.errors.badstatuscode")+" "+res.statusCode); }
                    else { res.pipe(feedparser); }
                });

                feedparser.on('error', function(error) { node.error(error,error); });

                feedparser.on('readable', function () {
                    var stream = this, article;
                    while (article = stream.read()) {  // jshint ignore:line
                        node.seenCycle.push(article.guid)
                        // if: Article UUID never seen or Date updated
                        if (!(article.guid in node.seen) || ( node.seen[article.guid] !== 0 && node.seen[article.guid] != article.date.getTime())) {
                            node.seen[article.guid] = article.date ? article.date.getTime() : 0;
                            var msg = {
                                topic: article.origlink || article.link,
                                payload: article.description,
                                article: article
                                //seenCount: Object.keys(node.seen).length,
                                //seenCycle: node.seenCycle.length
                            };

                            if (node.ignorefirst === true && node.donefirst === false) {
                                // do nothing
                            }
                            else {
                                node.send(msg);
                            }
                        }
                    }
                });

                feedparser.on('meta', function (meta) {});
                feedparser.on('end', function () {
                    // cleanup previous article guid
                    Object.keys(node.seen).forEach(function(key) {
                        if(!node.seenCycle.includes(key)) {
                            // console.log("DELETE " + key);
                            delete node.seen[key]
                        } else {
                            // console.log("KEEP   " + key);    
                        }
                    })
                });
            };
            // node.interval_id = setInterval(function() { node.donefirst = true; getFeed(); }, node.interval);
            // getFeed();
        }
        
        node.on("input", function(msg) {
            getFeed(msg);
        });

        node.on("close", function() {
            //if (this.interval_id != null) {
            //    clearInterval(this.interval_id);
            //}
        });
    }

    RED.nodes.registerType("feedparse-ext",FeedParseNode);
}
