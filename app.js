const Koa = require('koa');
const app = new Koa();
const audioMixing = require('./audioMixing')
const fs = require('fs');

app.use(async ctx => {
    let path = ctx.path;
    if (path === '/musicGenerate') {
        await audioMixing.generateMusic(ctx.query).then(data => {
            ctx.status = 200
            ctx.body = {
                codeMsg: 'success',
                data: data
            }
        }).catch(data => {
            ctx.status = 200
            ctx.body = {
                codeMsg: 'error',
                data: data
            }
        })
    }
    
    if (path === '/audioMix') {
        await audioMixing.mixAudio(ctx.query).then(data => {
            ctx.status = 200
            ctx.body = {
                codeMsg: 'success',
                data: data
            }
        }).catch(data => {
            ctx.status = 200
            ctx.body = {
                codeMsg: 'error',
                data: data
            }
        })

    }
    
});

app.listen(3001);
