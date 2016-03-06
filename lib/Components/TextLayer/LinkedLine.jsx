var React = require('tambo');
var AbstractComponents = require('../AbstractComponents/index.jsx');
var RowText = AbstractComponents.RowText;
var InlineText = AbstractComponents.InlineText;

var LinkedLine;

module.exports = LinkedLine = React.createClass({
  render : function(){
    var font = this.props.font;
    return <RowText style={{ font : font }} >{this.props.children.map(function(token){
      var scopes = token.scopes ? token.scopes[1] : void 0;
      var className = scopes ? scopes.split('.').join(' ') : '';
      return <InlineText className={className} >{token.value}</InlineText>
    })}</RowText>;
  }
});
