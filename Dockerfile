FROM debian:stretch

RUN apt-get update \
    && apt-get install ffmpeg \
    && apt-get install nodejs \
    && apt-get install npm \
    && rm -rf package-lock.json \
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
