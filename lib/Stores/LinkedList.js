
var EE = require('events').EventEmitter;

var LinkedList;

module.exports = LinkedList = function(items){
  EE.call(this);
  this.first = void 0;
  this.last = void 0;
  if (items instanceof Array){
    items.forEach(this.addLast.bind(this));
  }
  var length = 0;
  Object.defineProperty(this,'length',{
    get : function(){
      return length;
    }
  });

  this.on('add',function(){
    length++;
  });

  this.on('remove',function(){
    length--;
  });
};

var proto = LinkedList.prototype = Object.create(EE.prototype);

proto.get = function(target){
  var l = this.length;
  var cur = this.last;
  while(cur && --l !== target) cur = cur.prev;
  return cur;
};

proto.slice = function(start,end){
  if (typeof end !== 'number'){
    if (type)
  }
};

proto.iterateUntilNode = function(startNode,endNode,backwards){

}

proto.iterateUntilNumber = function(startNode,endNumber,backwards){

}

proto.addFirst = proto.unshift = function(item){
  if (!this.first){
    this.last = this.first = new Node(item);
  }else{
    this.first.addPrev(item);
  }
};

proto.removeFirst = proto.shift = function(){
  var first = this.first;
  this.first.remove();
  return first;
};

proto.addLast = proto.push = function(item){
  if (!this.last){
    this.first = this.last = new Node(item);
  }else{
    this.last.addNext(item);
  }
};

proto.removeFirst = proto.pop = function(){
  var last = this.last;
  this.last.remove();
  return last;
};

var Node;

Node = function(item,container){
  this.unique = Math.random().toString(32) + Date.now().toString(32);
  this.item = item;
  this.container = container;
};

Node.prototype.remove = function(){
  var container = this.container,prev = this.prev,next = this.next;
  if (!prev) container.first = next;
  else prev.next = next;
  if (!next) container.last = prev;
  else next.prev = prev;
  this.container = this.next = this.prev = null;
  container.emit('remove',this);
};

Node.prototype.addNext = function(item){
  var node = new Node(item,this.container);
  node.prev = this;

  var next = this.next;
  this.next = node;
  node.next = next;
  if (next){
    next.prev = node;
  }else{
    this.container.last = node;
  }
  this.container.emit('add',node);
};

Node.prototype.addPrev = function(item){
  var node = new Node(item,this.container);
  node.next = this;

  var prev = this.prev;
  this.prev = node;
  node.prev = prev;
  if (prev){
    prev.next = node;
  }else{
    this.container.last = node;
  }
  this.container.emit('add',node);
};
