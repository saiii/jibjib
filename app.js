const Hapi = require('@hapi/hapi');
const tree = require('./tree');

const init = async () => {
    const server = Hapi.server({
        port: process.env.PORT,
        host: 'localhost'
    });

    server.route({method: 'POST', path:'/tree', handler: tree.post});

    await server.start();
    console.log(`Server running on port ${process.env.PORT}...`);
};

init();
