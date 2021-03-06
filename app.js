const Koa = require('koa');
const app = new Koa();
const audioMixing = require('./audioMixing')
const audioChorus = require('./chorus')
app.use(async ctx => {
    let path = ctx.path;
  
    
    if (path === '/audioMixing') {
        await audioMixing.main(ctx.query).then(data => {
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
    if (path === '/audioChorus') {
        await audioChorus.main(ctx.query).then(data => {
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
