var EE = require('events').EventEmitter;

var Lines;

module.exports = Lines = function(text,lineSeparator){
  EE.call(this);
  this._lineSeparator = lineSeparator || '\n';
  this.setText(text);
};

var proto = Lines.prototype = Object.create(EE.prototype);
proto.constructor = Lines;

proto.setText = function(text){
  this._text = text;
  this._lines = text.split(this._lineSeparator);
  this.emit('update',this._lines);
};

proto.setLines = function(lines){
  this._text = lines.join(this._lineSeparator);
  this._lines = lines;
  this.emit('update',this._lines);
};
