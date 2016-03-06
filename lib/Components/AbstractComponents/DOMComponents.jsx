var React = require('tambo');
var ColorJS = require('color-js');

var defaultStyle = function(){
  return {
    padding : 0,
    margin : 0,
    border : 0,
    position : 'relative',
    fontFamily : 'monospace',
    textAlign : 'left'
  };
};

var formatNumber = function(num){
  if (0 < Math.abs(num) < 1) return `${num * 100}%`;
  return `${Math.round(num)}px`;
};

var formatStyle = function(style,font,newStyle){
  if (!style) style = {};
  if (!newStyle) newStyle = {};

  // only create properties that exist
  if (style.overflow) newStyle.overflow = style.overflow;
  if (style.textFlow) newStyle.textAlign = style.textFlow;
  if (style.textColor) newStyle.color = ColorJS(style.textColor).toCSS();
  if (style.bgColor) newStyle.backgroundColor = ColorJS(style.bgColor).toCSS();
  if (font){
    if (font.size) newStyle.fontSize = formatNumber(font.size);
    if (font.lineHeight) newStyle.lineHeight = formatNumber(font.lineHeight);
    if (font.bold) newStyle.fontWeight = 'bold';
  }
  if (style.offset){
    newStyle.top = formatNumber(style.offset.y || 0);
    newStyle.left = formatNumber(style.offset.x || 0);
  }else{
    newStyle.top = formatNumber(0);
    newStyle.left = formatNumber(0);
  }

  if (style.size){
    newStyle.width = formatNumber(style.size.x);
    newStyle.height = formatNumber(style.size.y);
  }

  return newStyle;
};

var Box,RowBox,RowText,InlineBox;

module.exports.Box = Box = React.createClass({
  render : function(){
    var style = formatStyle(this.props.style,this.props.font,defaultStyle());
    style.display = 'block';
    style.position = 'absolute';
    return <div {...this.props} style={style} >{this.props.children}</div>;
  }
});

module.exports.RowBox = RowBox = React.createClass({
  render : function(){
    var style = formatStyle(this.props.style,this.props.font,defaultStyle());
    style.display = 'block';
    return <p {...this.props} style={style} >{this.props.children}</p>;
  }
});

module.exports.RowText = RowText = React.createClass({
  render : function(){
    var style = formatStyle(this.props.style,this.props.font,defaultStyle());
    style.wordwrap = false;
    style.display = 'block';
    style.whiteSpace = 'pre';
    style.height = this.props.lineHeight;
    return <p {...this.props} style={style} >{[<span>&#8203;</span>].concat(this.props.children)}</p>;
  }
});

module.exports.InlineBox = InlineBox = React.createClass({
  render : function(){
    var style = formatStyle(this.props.style,this.props.font,defaultStyle());
    style.wordwrap = true;
    style.display = 'inline-block';
    style.position = 'static';
    return <pre {...this.props} style={style} >{this.props.children}</pre>;
  }
});

module.exports.InlineText = InlineBox = React.createClass({
  render : function(){
    var style = formatStyle(this.props.style,this.props.font,defaultStyle());
    style.wordwrap = false;
    style.display = 'inline';
    style.position = 'static';
    style.whiteSpace = 'pre';
    return <span {...this.props} style={style} >{this.props.children}</span>;
  }
});
