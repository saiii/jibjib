const Hapi = require('@hapi/hapi');
const pug = require('pug');
const tree = require('./tree');
const github = require('./github');

const init = async () => {
    const server = Hapi.server({
        port: process.env.PORT,
        host: 'localhost'
    });
    await server.register(require('@hapi/vision'));
    server.views({engines: { html: pug }, relativeTo: __dirname, path: 'views'});
    server.route({method: 'POST', path:'/tree', handler: async(req, h) => {
      return tree.create(req.payload);
    }});
    server.route({method: 'GET', path:'/', handler: async (req, h) => {
      let data = await github.search('nodejs', req.query.url);
      return h.view('index', data);
    }});

    await server.start();
    console.log(`Server running on port ${process.env.PORT}...`);
};


init();
