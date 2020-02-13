FROM debian:stretch
WORKDIR /app
COPY . /app

RUN apt-get update --assume-yes
RUN apt-get install ffmpeg --assume-yes
RUN apt-get install curl  --assume-yes
RUN curl -sL https://deb.nodesource.com/setup_6.x | bash -
RUN apt-get install -y nodejs --assume-yes
RUN apt-get install -y npm --assume-yes
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
