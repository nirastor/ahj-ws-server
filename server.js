const http = require('http');
const Koa = require('koa');
const Router = require('koa-router');
const cors = require('koa2-cors');
const koaBody = require('koa-body');
const WS = require('ws');

const app = new Koa();
app.use(cors());
app.use(koaBody({json: true}));

const port = 7001;
const router = new Router();
app.use(router.routes()).use(router.allowedMethods());
const server = http.createServer(app.callback());
const wsServer = new WS.Server({server});

const users = ['exist1', 'exist2'];

router.get('/test', async (ctx, next) => {
    ctx.response.body = {
        status: "ok",
        timestamp: Date.now(),
    };
});
router.post('/check', async (ctx, next) => {
    const { userName } = ctx.request.body
    console.log(ctx.request)
    if (users.includes(userName)) {
        ctx.response.body = {
            access: false,
            errorMessage: "Такой пользователь уже существует",
        };
    } else {
        users.push(userName)
        ctx.response.body = {
            access: true,
            userName,
        };
    }
});
router.post('/exit', async(ctx, next) => {
    const { userName } = ctx.request.body
    const index = users.findIndex(o => o === userName);
    if (index !== -1) {
        users.splice(index, 1);
    }
    ctx.response.status = 204;
});

wsServer.on('connection', (ws, req) => {
    ws.on('message', msg => {
        [...wsServer.clients]
            .filter(c => c.readyState === WS.OPEN)
            .forEach(c => c.send('to all', msg))
    });
    ws.send('welcome', errCallback);
});


server.listen(port, () => console.log('server started'));