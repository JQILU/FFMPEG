const Koa = require('koa');
const app = new Koa();
const audioMixing = require('./audioMixing')
app.use(async ctx => {
    let path = ctx.path;
    if (path === '/audioMixing') {
        ctx.body = {
            codeMsg: 'success',
            data: audioMixing.main(ctx.query)
        }
    }
});

app.listen(3000);