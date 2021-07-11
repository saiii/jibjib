const assert = require('assert');
const github = require('../github');

describe('Github::search', function() {
  it('should return -1 when the value is not present', function() {
      assert.equal([1, 2, 3].indexOf(4), -1);
  });
});
