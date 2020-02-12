FROM debian:stretch

RUN apt-get update --assume-yes
RUN apt-get install ffmpeg --assume-yes

FROM node:lts-alpine
WORKDIR /app
COPY . /app
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
