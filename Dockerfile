FROM ubuntu:latest
WORKDIR /app
COPY . /app

RUN apt-get update --assume-yes
RUN apt-get install ffmpeg --assume-yes
RUN apt-get install nodejs --assume-yes
RUN apt-get install npm --assume-yes
RUN npm install pm2 -g --assume-yes

RUN rm -rf package-lock.json \
    && rm -rf node_modules \
    && npm config set registry "https://registry.npm.taobao.org/" \
    && npm install 

RUN cd ./web \
    && rm -rf package-lock.json \
    && rm -rf node_modules \
    && npm install \
    && cd ../

RUN  chmod -R 777 ./web
EXPOSE 3000 3001
CMD ["sh","-c","pm2 start ./web/bin/www ./app.js && pm2 monit"]
