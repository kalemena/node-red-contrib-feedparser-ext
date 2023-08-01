
module.exports = function(RED) {
    "use strict";
    var FeedParser = require("feedparser");
    var request = require("request");
    var url = require('url');

    function FeedParseNode(n) {
        RED.nodes.createNode(this,n);
        this.url = n.url;
        this.ignorefirst = n.ignorefirst || false;
        this.seen = {};
        this.seenCycle = [];
        this.donefirst = false;
        var node = this;
        var getFeed = function(urlOfFeed, msg) {
            var req = request(urlOfFeed, {timeout:10000, pool:false});
            //req.setMaxListeners(50);
            req.setHeader('user-agent', 'Mozilla/5.0 (Node-RED)');
            req.setHeader('accept', 'application/rss+xml,text/html,application/xhtml+xml,application/xml');

            var feedparser = new FeedParser();
            node.seenCycle = []

            req.on('error', function(err) { node.error(err); });

            req.on('response', function(res) {
                if (res.statusCode != 200) { 
                    node.warn(RED._("feedparse-ext.errors.badstatuscode")+" "+res.statusCode); 
                } else { 
                    res.pipe(feedparser); 
                }
            });

            feedparser.on('error', function(error) { node.error(error,error); });

            feedparser.on('readable', function () {
                var stream = this, article;
                while (article = stream.read()) {  // jshint ignore:line
                    node.seenCycle.push(article.guid)
                    // if: Article UUID never seen or Date updated
                    node.seen[urlOfFeed] = node.seen[urlOfFeed] || {}
                    if (!(article.guid in node.seen[urlOfFeed]) || ( node.seen[urlOfFeed][article.guid] !== 0 && node.seen[urlOfFeed][article.guid] != article.date.getTime())) {
                        node.seen[urlOfFeed][article.guid] = article.date ? article.date.getTime() : 0;
                        var msg = {
                            topic: article.origlink || article.link,
                            payload: article.description,
                            article: article
                            //seenCount: Object.keys(node.seen[urlOfFeed]).length,
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
                // console.log("URL: " + urlOfFeed)
                Object.keys(node.seen[urlOfFeed]).forEach(function(key) {
                    if(!node.seenCycle.includes(key)) {
                        // console.log("DELETE " + key);
                        delete node.seen[urlOfFeed][key]
                    } else {
                        // console.log("KEEP   " + key);    
                    }
                })
            });
        };
        
        node.on("input", function(msg) {
            var urlOfFeed;
            if(msg.payload != null){
                urlOfFeed = msg.payload;
            } else {
                urlOfFeed = node.url;
            }

            var parsedUrlOfFeed = url.parse(urlOfFeed);
            if (!(parsedUrlOfFeed.host || (parsedUrlOfFeed.hostname && parsedUrlOfFeed.port)) && !parsedUrlOfFeed.isUnix) {
                node.error(RED._("feedparse-ext.errors.invalidurl"),RED._("feedparse-ext.errors.invalidurl"));
            }
            
            getFeed(urlOfFeed, msg);
        });

        node.on("close", function() {
        });
    }

    RED.nodes.registerType("feedparse-ext",FeedParseNode);
}
