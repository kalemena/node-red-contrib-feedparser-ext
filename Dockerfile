FROM kalemena/node-red:latest

COPY --chown=nodered:nodered [ "package*.json", "32-feedparse.*", "LICENSE", "README.md", "/opt/node-red-contrib-feedparser-ext/" ]
COPY --chown=nodered:nodered [ "examples", "/opt/node-red-contrib-feedparser-ext/examples/" ]
COPY --chown=nodered:nodered [ "locales", "/opt/node-red-contrib-feedparser-ext/locales/" ]
RUN cd /opt/node-red-contrib-feedparser-ext \
  && npm install \
  && cd /opt/node-red \
  && npm i \
        /opt/node-red-contrib-feedparser-ext