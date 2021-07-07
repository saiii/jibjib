
function node(id, title, level, children, parent_id) {
  this.id = id;
  this.title = title;
  this.level = level;
  this.children = children;
  this.parent_id = parent_id;

  this.value = function() {
    let children = [];
    for(let c of this.children) {
      children.push(c.value());
    }
    return {id: this.id, title: this.title, level: this.level, children, parent_id: this.parent_id};
  }
  this.add = function(node) {
    if (this.id === node.parent_id)  {
      this.children.push(node);
      return true;
    }
    else {
      for (let c of this.children) {
        if (c.add(node)) return true;
      }
      return false;
    }
  }
}

function tree() {
  this.roots = [];
  this.add = function(node){
    if (node.parent_id === null) {
      if (this.roots.length > 0) {
        console.log('WARNING: Detect multiple root nodes');
      }
      this.roots.push(node);
      return true;
    }
    else {
      let found = false;
      for(let n of this.roots) {
        if (n.add(node)) {
          found = true;
          break;
        }
      }
      if (!found) {
        return false;
      }
      else {
        return true;
      }
    }
  }
  this.value = function(){
    let roots = [];
    for(let r of this.roots) {
      roots.push(r.value());
    }
    return roots;
  }
}

const post = (request, h) => {
  let data = request.payload;
  let t = new tree();
  for (const item of Object.entries(data)) {
    let level = parseInt(item[0]);
    let nodes = item[1];
    for(let n of nodes) {
      if (n.level !== level) {
        console.log('WARNING: Unusual level is detected for:', n);
      }
      if (n.children.length > 0) {
        console.log('WARNING: Initial children is not empty!', n);
      }
      let nd = new node(n.id, n.title, n.level, n.children, n.parent_id);
      if (!t.add(nd)) {
        console.log('WARNING: Unable to add this node to the tree!', n);
      }
    }
  }
  const ret = t.value();
  return ret;
}

module.exports = {post}
