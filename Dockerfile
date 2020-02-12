FROM node:lts-alpine

WORKDIR /app
COPY . /app

RUN rm -f package-lock.json \
    && rm -rf node_modules \
    && npm config set registry "https://registry.npm.taobao.org/" \
    && npm install \
    && cd web \
    && rm -rf package-lock.json \
    && rm -rf node_modules \
    && npm install \
    && cd ../
    && chmod 777 ./entrypoint.sh
    
EXPOSE 3001 3000

ENTRYPOINT ["./entrypoint.sh"]
