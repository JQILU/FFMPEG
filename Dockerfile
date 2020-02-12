FROM debian:stretch

RUN apt-get update --assume-yes
RUN apt-get install ffmpeg --assume-yes
RUN apt-get install node --assume-yes
RUN apt-get install npm --assume-yes
RUN rm -rf package-lock.json \
    && rm -rf node_modules \
    && npm config set registry "https://registry.npm.taobao.org/" \
    && npm install \
    && cd web \
    && rm -f package-lock.json \
    && rm -rf node_modules \
    && npm install \
    && cd ../
    
EXPOSE 3001 3000

CMD ["nohup","node","./app.js","&","node","./web/bin/www","&"]
