const assert = require('assert');
const github = require('../github');

describe('Github::search', function() {
  it('should handle error properly when the result is not HTTP 200', async function() {
    let result = await github.search('nodejs', 'https://api.test.com', async function(url){
      return {status: 500, data: {}, headers: {link: ','}};
    });
    assert.deepStrictEqual(result, {content: [], nav: {cur: 0, first: '/', last: '/', next: '/', prev: '/'}});
  });

  it('should handle data properly when the result is valid', async function() {
    let result = await github.search('nodejs', 'https://api.github.com/search/repositories?q=nodejs&per_page=100&page=9', async function(url){
      return {status: 200, data: {items: []}, headers: {link: '<A>; rel="first", <B>; rel="last", <C>; rel="next", <D>; rel="prev"'}};
    });
    assert.deepStrictEqual(result, {content: [], nav: {cur: '9', first: '/?url=A', last: '/?url=B', next: '/?url=C', prev: '/?url=D'}});
  });

  it('should handle data properly when the header contains no link', async function() {
    let result = await github.search('nodejs', 'https://api.github.com/search/repositories?q=nodejs&per_page=100&page=9', async function(url){
      return {status: 200, data: {items: []}, headers: {}};
    });
    assert.deepStrictEqual(result, {content: [], nav: {cur: '9', first: '#', last: '#', next: '#', prev: '#'}});
  });

  it('should handle data properly when the number of data items is less than 100', async function() {
    let result = await github.search('nodejs', 'https://api.github.com/search/repositories?q=nodejs&per_page=100&page=9', async function(url){
      return {status: 200, data: {items: [{name: 'John', html_url: 'Doe'}]}, headers: {}};
    });
    assert.deepStrictEqual(result, {content: [{"row":[{name: 'John', url: 'Doe'}]}], nav: {cur: '9', first: '#', last: '#', next: '#', prev: '#'}});
  });

  it('should handle data properly when the number of data items have no name and html_url fields', async function() {
    let result = await github.search('nodejs', 'https://api.github.com/search/repositories?q=nodejs&per_page=100&page=9', async function(url){
      return {status: 200, data: {items: [{a: 'John', b: 'Doe'}]}, headers: {}};
    });
    assert.deepStrictEqual(result, {content: [{"row":[{name: undefined, url: undefined}]}], nav: {cur: '9', first: '#', last: '#', next: '#', prev: '#'}});
  });
});

describe('Github::extractLinkUrl', function() {
  it('should return a link when the value is valid', function() {
    let result = github.extractLinkUrl("<https://google.co.th>");
    assert.deepStrictEqual(result, "https://google.co.th");
  });

  it('should return the given string when the link is invalid', function() {
    let result = github.extractLinkUrl("https://google.co.th");
    assert.deepStrictEqual(result, "https://google.co.th");
  });

  it('should return empty string when the link is a minimal one', function() {
    let result = github.extractLinkUrl("<>");
    assert.deepStrictEqual(result, "");
  });

  it('should return <> when the link is <<>>', function() {
    let result = github.extractLinkUrl("<<>>");
    assert.deepStrictEqual(result, "<>");
  });
});

describe('Github::extractAction', function() {
  it('should return input string when the value has no separator', function() {
    let result = github.extractAction("abc");
    assert.deepStrictEqual(result, "abc");
  });

  it('should return input string when the value contains only a separator', function() {
    let result = github.extractAction("=");
    assert.deepStrictEqual(result, "=");
  });

  it('should return a valid label when the value is in the right format', function() {
    let result = github.extractAction("a=\"b\"");
    assert.deepStrictEqual(result, "b");
  });

  it('should return an empty string when the value is minimal', function() {
    let result = github.extractAction("a=\"\"");
    assert.deepStrictEqual(result, "");
  });
});
