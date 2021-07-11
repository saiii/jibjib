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

function extractLinkUrl(data) {
  // Input format -> <url>
  // Remove < and > from the data
  if (data.startsWith("<") && data.endsWith(">")) {
    let url = data.substring(1, data.length - 1);
    return url;
  }
  console.log('WARNING: The url does not contain < and >');
  return data;
}

function extractAction(data) {
  // Input format -> rel="action"
  // The action could be next, prev, last, first
  let parts = data.split('=');
  if (parts.length === 2 && parts[1].startsWith("\"") && parts[1].endsWith("\"")) {
    let ret = parts[1].substring(1, parts[1].length - 1);
    return ret;
  }
  console.log('WARNING: The url does not contain = or "', data);
  return data;
}

async function search(keyword, base_url) {
  const page = 1;
  const page_size = 100;
  const user = 'mozilla';
  const api_path = typeof base_url === 'undefined' ? `https://api.github.com/search/code?q=${keyword}+user:${user}&per_page=${page_size}&page=${page}` : base_url;
  let result = await axios.get(api_path).catch(function (error) {
    console.error(error);
  });
  if (typeof result === 'undefined' || result.status !== 200) {
    console.error('Error: rate limit?')
    return {
      content: [],
      nav: {next: '/', prev: '/', last: '/', first: '/', cur: 0}
    }
  }
  else {
    const url_params = new URLSearchParams(api_path);
    const cur = url_params.get('page');

    let links = result.headers.link.split(',')
    let nav = {next: '#', prev: '#', last: '#', first: '#', cur: cur};
    for(let link of links) {
      let line = link.trim();
      let parts = line.split(';'); // line is in the format of url;action
      let url = extractLinkUrl(parts[0]);
      let action = extractAction(parts[1]);
      nav[action] = '/?url=' + encodeURIComponent(url);
    }
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
}

init();
