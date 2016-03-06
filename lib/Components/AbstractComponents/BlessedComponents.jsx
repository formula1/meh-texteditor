var React = require('tambo');
var ColorJS = require('color-js');

var defaultStyle = function(){
  return {
    border : {},
    wrap: false,

    left : 'left'
  };
};

var formatNumber = function(num){
  if (0 < Math.abs(num) < 1) return `${num * 100}%`;
  return `${Math.round(num/16)}`;
};

var formatStyle = function(style,font,newStyle){
  if (!style) style = {};
  if (!newStyle) newStyle = {style:{}};

  // only create properties that exist
  if (style.overflow) newStyle.scrollable = style.overflow !== 'hidden';
  if (style.textFlow) newStyle.align = style.textFlow;
  if (style.textColor) newStyle.style.fg = ColorJS(style.textColor).toHex();
  if (style.bgColor) newStyle.style.bg = ColorJS(style.bgColor).toHex();
  if (font){
    if (font.size) newStyle.fontSize = formatNumber(font.size);
    if (font.lineHeight) newStyle.lineHeight = formatNumber(font.lineHeight);
    if (font.bold) newStyle.style.bold = true;
    if (font.lines) newStyle.style.underline = !!font.lines.under;
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
    return <Box style={style} >{this.props.children}</Box>;
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
    return <Line {...this.props} style={style} >{[<span>&#8203;</span>].concat(this.props.children)}</Line>;
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
