var EE = require('events').EventEmitter;

var TextUtil = require('../Util/text');
var Cursor;

module.exports = Cursor = function(lines){
  EE.call(this);
  this.position = { x : 0,y : 0 };
  this.requestedX = 0;
  this.isSelecting = false;
  this.selPosition = void 0;
  this.setLines(lines);
};

var proto = Cursor.prototype = Object.create(EE.prototype);
proto.constructor = Cursor;

proto.setLines = function(newLines){
  console.trace();
  this.lines = newLines;
  var x = this.position.x,y = this.position.y;
  y = Math.max(0,Math.min(this.lines.length - 1,y));
  x = Math.max(0,Math.min(this.lines[y].length,x));

  this.position = {
    x : x,y : y
  };
};

Object.defineProperty(proto,'min',{
  get : function(){
    if (!this.selPosition) return this.position;
    if (this.position.y < this.selPosition.y) return this.position;
    if (this.position.y > this.selPosition.y) return this.selPosition;
    if (this.position.x < this.selPosition.x) return this.position;
    if (this.position.x > this.selPosition.x) return this.selPosition;
    return this.position;
  }
});

Object.defineProperty(proto,'max',{
  get : function(){
    if (!this.selPosition) return this.position;
    if (this.position.y > this.selPosition.y) return this.position;
    if (this.position.y < this.selPosition.y) return this.selPosition;
    if (this.position.x > this.selPosition.x) return this.position;
    if (this.position.x < this.selPosition.x) return this.selPosition;
    return this.position;
  }
});

proto.setSelecting = function(boo){
  this.isSelecting = boo;
  this.selPosition = boo ? { x : this.position.x,y : this.position.y } : void 0;
};

proto.update = function(x,y){
  y = typeof y === 'number' ? Math.max(0,Math.min(this.lines.length,y - 1)) : this.position.y;
  x = typeof x === 'number' ? Math.max(0,Math.min(this.lines[y].length,x)) : this.position.x;
  this.position = {
    x : x,y : y
  };
  this.emit('update');
};

proto.move = function(x,y,jump){
  if (x){
    y = this.position.y;
    var text = this.lines[y];
    if (jump){
      x = TextUtil.nextWordBound(text,this.position.x,x < 0);
      if (x === -1){
        x = x > 0 ? text.length : 0;
      }
    }else{
      x += this.position.x;
      if (x < 0){
        if (y === 0) return;
        y -= 1;
        text = this.lines[y];
        x = text.length;
      }else if (x > text.length){
        y += 1;
        x = 0;
      }
    }
    this.requestedX = x;
    this.update(x,y);
  }else if (y){
    if (y < 0 && this.position.y === 0) return;
    if (y > 0 && this.position.y === this.lines.length - 1) return;
    y += this.position.y;
    var text = this.lines[y];
    var x = Math.min(text.length,this.requestedX);
    this.update(x,y);
  }
};

proto.delete = function(forward,jump){
  if (this.isSelecting){
    var preventUpdate = forward;
    var min = this.min;
    var max = this.max;
    if (min.y === max.y){
      if (min.x === max.x) return min;
      var text = this.lines[min.y];
      this.lines[min.y] = text.substring(0,min.x) + text.substring(max.x);
      if (!preventUpdate){
        this.emit('lines',this.lines);
        this.update(min.x,min.y);
      }else{
        this.selPosition = min;
        return min;
      }
      return;
    }
    this.lines[min.y] = text.substring(0,min.x);
    var remove = max.y - (min.y + 1) - 1;
    this.lines.splice(min.y + 1,remove);
    this.lines[min.y+1] = this.lines[min.y+1].substring(max.x);
    if (!preventUpdate){
      this.emit('lines',this.lines);
      this.update(min.x,min.y);
    }else{
      this.selPosition = min;
      return min;
    }
    return;
  }

  var x = this.position.x,y = this.position.y;
  var text = this.lines[y];
  var amount = jump ? TextUtil.nextWordBound(text,x,!forward) : 1;
  if (forward){
    if (x === text.length){
      if (y === this.lines.length - 1) return;
      var removed = this.lines.splice(y + 1,1)[0];
      this.lines[y] = text + removed;
      this.emit('lines',this.lines);
      return;
    }
    this.lines[y] = text.substring(0,x) + text.substring(x + amount);
    this.emit('lines',this.lines);
  }else{
    if (x === 0){
      if (y === 0) return;
      var removed = this.lines.splice(y - 1,1)[0];
      this.lines[y] = removed + text;
      this.emit('lines',this.lines);
      return this.update(removed.length,y-1);
    }
    this.lines[y] = text.substring(0,x - amount) + text.substring(x);
    this.emit('lines',this.lines);
    this.update(x - amount,y);
  }
};

proto.add = function(text){
  var pos = (this.isSelecting) ? this.delete(true) : this.position;

  var toAdd = TextUtil.splitLines(text);
  var x = pos.x,y = pos.y;
  var text = this.lines[y];

  this.lines[y] = text.substring(0,x) + toAdd.shift();
  while(toAdd.length){
    y++;
    this.lines.splice(y,0,toAdd.shift());
  }
  var lastlen = this.lines[y].length;
  this.lines[y] += text.substring(x);

  this.emit('lines',this.lines);
  this.update(lastlen,y);
};

proto.newLine = function(){
  var pos = (this.isSelecting) ? this.delete(true) : this.position;

  var x = pos.x,y = pos.y;
  if (x === 0){
    this.lines.splice(y,0,'');
    this.emit('lines',this.lines);
    return this.update(x,y+1);
  }
  var text = this.lines[y];
  if (x === text.length){
    this.lines.splice(y+1,0,'');
    this.emit('lines',this.lines);
    return this.update(0,y+1);
  }
  var prevText = text.substring(0,x);
  var nextText = text.substring(x);
  this.lines[y] = prevText;
  this.lines.splice(y+1,0,nextText);
  this.emit('lines',this.lines);
  this.update(0,y+1);
};
