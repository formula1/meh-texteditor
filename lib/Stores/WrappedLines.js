var EE = require('events').EventEmitter;

var TextUtil = require('../Util/text');

var WrappedLines;

module.exports = WrappedLines = function(text,options){
  EE.call(this);
  this._lineSeparator = options.lineSeparator || '\n';
  this._maxLength = options.maxLength || 0;
  this._font = options.font || false;
  this.setText(text);
};

var proto = WrappedLines.prototype = Object.create(EE.prototype);
proto.constructor = WrappedLines;

WrappedLines.wrap = function(text,maxLength){
  var substring =  text.substring(0,maxLength);
  var i = TextUtil.nextWordBound(substring,maxLength,true);
  if (i > 0){
    return [
      substring.substring(0,i),
      text.substring(i)
    ];
  }

  return [
    substring,
    text.substring(maxLength)
  ];
};

proto.setText = function(text){
  this._text = text;
  this._lines = text.split(this._lineSeparator);
  var maxLength = this._maxLength;
  this._wrapped = this._lines.map(function(line){
    if (maxLength <= 0  || line.length <= maxLength) return line;
    var sublines = [];
    do{
      line = WrappedLines.wrap(line);
      sublines.push(line[0]);
      line = line[1];
    }while(line.length);
    return sublines;
  });
  this.emit('update',this._lines);
};

proto.setLines = function(lines){
  console.log('setLines');
  this._lines = lines;
  this._text = this._lines.join(this._lineSeparator);
  var maxLength = this._maxLength;
  this._wrapped = this._lines.map(function(line){
    if (maxLength <= 0 || line.length <= maxLength) return line;
    var sublines = [];
    do{
      line = WrappedLines.wrap(line);
      sublines.push(line[0]);
      line = line[1];
    }while(line.length);
    return sublines;
  });
  this.emit('update',this._lines);
};

proto.getLines = function(){
  return this._lines;
};

proto.setWrappedLines = function(wlines){
  this._wrapped = wlines;
  this._lines = this._wrapped.map(function(line){
    if (line instanceof Array) return line.join('');
    return line;
  });
  this._text = this._lines.join(this._lineSeparator);
  this.emit('update',this._lines);
};
