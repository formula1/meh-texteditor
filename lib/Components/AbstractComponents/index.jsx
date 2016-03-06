var React = require('tambo');

var Box,Row,TextRow,Column,InlineBlock;

switch(process.env.RENDERING_ENGINE){
  case 'DOM' :
    var DOMComponents = require('./DOMComponents.jsx');
    Box = DOMComponents.Box; // expected to be absolutely positioned
    RowBox = DOMComponents.RowBox; // expected to completely consume a line
    RowText = DOMComponents.RowText; // expected to completely consume a line but vertically conform
    Column = DOMComponents.Column; // expected to completely consume a column
    InlineBox = DOMComponents.InlineBlock; // expected to follow the flow of text
    InlineText = DOMComponents.InlineText;
}

module.exports.Box = React.createClass({
  render : function(){
    return <Box {...this.props} >{this.props.children}</Box>;
  }
});

module.exports.RowBox = React.createClass({
  render : function(){
    return <RowBox {...this.props} >{this.props.children}</RowBox>;
  }
});

module.exports.RowText = React.createClass({
  render : function(){
    return <RowText {...this.props} >{this.props.children}</RowText>;
  }
});

module.exports.Column = React.createClass({
  render : function(){
    return <Column {...this.props} >{this.props.children}</Column>;
  }
});

module.exports.InlineBox = React.createClass({
  render : function(){
    return <InlineBox {...this.props} >{this.props.children}</InlineBox>;
  }
});

module.exports.InlineText = React.createClass({
  render : function(){
    return <InlineText {...this.props} >{this.props.children}</InlineText>;
  }
});
