FROM node:lts-alpine

WORKDIR /app
COPY . /app

RUN 
    sudo add-apt-repository ppa:kirillshkrogalev/ffmpeg-next \
    ; sudo apt-get update \
    ; sudo apt-get install ffmpeg \
    ; rm -f package-lock.json \
    ; rm -rf node_modules \
    ; npm config set registry "https://registry.npm.taobao.org/" \
    && npm install

EXPOSE 3001
CMD ["node", "app.js"]
