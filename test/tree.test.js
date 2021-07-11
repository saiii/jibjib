const assert = require('assert');
const tree = require('../tree');

describe('Tree::create', function() {
  it('empty input', function() {
    let result = tree.create({});
    assert.deepStrictEqual(result, []);
  });

  it('a minimal tree', function(){
    let result = tree.create(
      {"0": [{
        "id": 1,
        "title": "House",
        "level": 0,
        "children": [],
        "parent_id": null}]
      });
    assert.deepStrictEqual(result, [{"id": 1, "title": "House", "level": 0, "children": [], "parent_id": null}]);
  });

  it('a simple tree', function(){
    let result = tree.create({
      "0": [{"id": 1, "title": "a", "level": 0, "children": [], "parent_id": null}],
      "1": [{"id": 2, "title": "b", "level": 1, "children": [], "parent_id": 1}],
      "2": [{"id": 3, "title": "c", "level": 2, "children": [], "parent_id": 2}]
    });
    assert.deepStrictEqual(result, [
      { "children": [ {
        "children": [ {
          "children": [],
          "id": 3, "level": 2, "parent_id": 2, "title": "c" } ],
        "id": 2, "level": 1, "parent_id": 1, "title": "b" }
      ],
      "id": 1,
      "level": 0,
      "parent_id": null,
      "title": "a"
      }
    ]);
  });

  it('a deep tree', function(){
    const SIZE = 4000;
    let id = 1;
    let input = {"0": [{"id": id, "title": id+"", "level": 0, "children": [], "parent_id": null}]};
    id += 1;
    for(let i = 1; i < SIZE; i += 1) {
      input[i+""] = [{"id": id, "title": id+"", "level": i, "children": [], "parent_id": id - 1}]
      id += 1;
    }
    let result = tree.create(input);

    let obj = result[0];
    for(let i = 0; i < (SIZE - 1); i += 1) {
      obj = obj.children[0]
    }
    assert.equal(obj.id, SIZE);
  });

  it('non-empty children list', function(){
    let result = tree.create({
      "0": [{"id": 1, "title": "a", "level": 0, "children": [], "parent_id": null}],
      "1": [{"id": 2, "title": "b", "level": 1, "children": [{id: 4}], "parent_id": 1}],
      "2": [{"id": 3, "title": "c", "level": 2, "children": [], "parent_id": 2}]
    });
    assert.deepStrictEqual(result, [
    {
        "id": 1,
        "title": "a",
        "level": 0,
        "children": [
            {
                "id": 2,
                "title": "b",
                "level": 1,
                "children": [
                    {
                        "id": 4
                    },
                    {
                        "id": 3,
                        "title": "c",
                        "level": 2,
                        "children": [],
                        "parent_id": 2
                    }
                ],
                "parent_id": 1
            }
        ],
        "parent_id": null
    }
    ]);
  });

  it('the input is in wrong order', function(){
    let result = tree.create({
      "0": [{"id": 1, "title": "a", "level": 0, "children": [], "parent_id": null}],
      "2": [{"id": 3, "title": "c", "level": 2, "children": [], "parent_id": 2}],
      "1": [{"id": 2, "title": "b", "level": 1, "children": [], "parent_id": 1}]
    });
    assert.deepStrictEqual(result, [
      { "children": [ {
        "children": [ {
          "children": [],
          "id": 3, "level": 2, "parent_id": 2, "title": "c" } ],
        "id": 2, "level": 1, "parent_id": 1, "title": "b" }
      ],
      "id": 1,
      "level": 0,
      "parent_id": null,
      "title": "a"
      }
    ]);
  });

  it('no root node', function(){
    let result = tree.create({
      "0": [{"id": 1, "title": "a", "level": 0, "children": [], "parent_id": 3}],
      "1": [{"id": 2, "title": "b", "level": 1, "children": [], "parent_id": 1}],
      "2": [{"id": 3, "title": "c", "level": 2, "children": [], "parent_id": 2}]
    });
    assert.deepStrictEqual(result, []);
  });
});
