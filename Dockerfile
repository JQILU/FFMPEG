FROM debian:stretch
RUN apt-get update --assume-yes
RUN apt-get install ffmpeg --assume-yes

FROM node:lts-alpine
WORKDIR /app
COPY . /app
RUN rm -rf package-lock.json \
    && rm -rf node_modules \
    && npm config set registry "https://registry.npm.taobao.org/" \
    && npm install 
EXPOSE 3001
CMD ["nohup","node","./app.js"]

FROM node:lts-alpine
WORKDIR /app
COPY . /app
RUN cd ./web \
    && rm -rf package-lock.json \
    && rm -rf node_modules \
    && npm config set registry "https://registry.npm.taobao.org/" \
    && npm install 
EXPOSE 3000
CMD ["npm","start"]