const Hapi = require('@hapi/hapi');
const pug = require('pug');
const tree = require('./tree');
const axios = require('axios');

const init = async () => {
    const server = Hapi.server({
        port: process.env.PORT,
        host: 'localhost'
    });
    await server.register(require('@hapi/vision'));
    server.views({engines: { html: pug }, relativeTo: __dirname, path: 'views'});
    server.route({method: 'POST', path:'/tree', handler: tree.post});
    server.route({method: 'GET', path:'/', handler: async (req, h) => {
      let data = await search('nodejs', req.query.url);
      return h.view('index', data);
    }});

    await server.start();
    console.log(`Server running on port ${process.env.PORT}...`);
};

async function search(keyword, base_url) {
  const page = 1;
  const page_size = 100;
  const user = 'mozilla';
  const api_path = typeof base_url === 'undefined' ? `https://api.github.com/search/code?q=${keyword}+user:${user}&per_page=${page_size}&page=${page}` : base_url;
  let result = await axios.get(api_path);

  const url_params = new URLSearchParams(api_path);
  const cur = url_params.get('page');

  let links = result.headers.link.split(',')
  let nav = {next: '#', prev: '#', last: '#', first: '#', cur: cur};
  for(let link of links) {
    let line = link.trim();
    let url = line.split(';')[0].replace("<","").replace(">","");
    let action = line.split(';')[1].split('=')[1].replace("\"","").replace("\"", "");
    nav[action] = '/?url=' + encodeURIComponent(url);
  }
  console.log(nav)
  let content = [];
  let row = [];
  for(let item of result.data.items){
    row.push({name: item.repository.name, url: item.repository.html_url})
    if (row.length >= 10) {
      content.push({row});
      row = []
    }
  }
  return {
    content,
    nav
  }
}

init();
