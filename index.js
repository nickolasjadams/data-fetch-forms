const server = require('server');
const { get, post } = server.router;
const cors = [
    ctx => header("Access-Control-Allow-Origin", "*"),
    ctx => header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"),
    ctx => header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE, HEAD"),
    ctx => ctx.method.toLowerCase() === 'options' ? 200 : false,
];

const { header, render, redirect } = server.reply;

const port = 3002;

// Launch server with options and a couple of routes
server({ port: port, security: false, views: './public' }, cors, [
  get('/', () => render('./index.html')),
  get('/db.json', () => render('./db.json')),
  get('/db2.json', () => render('./db2.json')),
  get('/test/get', ctx => {
      console.log(ctx);
      return ctx.query;
      return 'ok';
  }),
  post('/test/post', ctx => {
      console.log(ctx);
      return {...ctx.data, ...ctx.files};
      return 'ok';
  }),
]).then(async app => {
    console.log(`Serving on: http://localhost:${port}`);
});