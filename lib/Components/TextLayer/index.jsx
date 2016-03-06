var React = require('tambo');
var _ = require('lazy.js');
var TextUtil = require('../../Util/text');
var TextLayer;

var AbstractComponents = require('../AbstractComponents/index.jsx');
var RowBox = AbstractComponents.RowBox;
var LinkedLine = require('./LinkedLine.jsx');

module.exports = TextLayer = React.createClass({
  componentWillMount : function(){
    var lineStore = this.props.lineStore;
    this.props.lineStore.on('update',this.updateLines.bind(this));
    this.updateLines();
  },

  componentWillRecieveProps : function(props){
    if (props.lineStore !== this.props.lineStore){
      this.props.lineStore.removeListener('update',this.updateLines);
      props.lineStore.on('update',this.updateLines.bind(this));
    }
  },

  componentWillUnmount : function(){
    this.props.lineStore.removeListener('update',this.updateLines);
  },

  updateLines : function(){
    var lines = this.props.lineStore.getLines();
    this.setState({
      lines : lines
    });
  },

  computeHeight : function(child){
    return this.props.font.lineHeight;
  },

  tokenizeLines : function(lines,grammar){
    if (!grammar){
      return lines.map(function(line){
        return [{ value : line }];
      });
    }
    var tags = [];
    var ruleStack = null; //strange they would assume that its null instead of empty
    var scopes = [];
    return lines.map(function(line,i){
      var res = grammar.tokenizeLine(line,ruleStack,i===0);
      ruleStack = res.ruleStack;
      tags = res.tags;
      first = false;
      var tokens = grammar.registry.decodeTokens(line,res.tags,scopes);
      return tokens;
    });
  },

  render : function(){
    var viewport = this.props.viewport;
    var font = this.props.font;

    var scrollOffset = this.props.scroll.y;
    var currentYPos = 0;
    var height = this.props.viewport.y;

    var offset = false;

    // Question : Do I want to split it up into Scoped section?
    // When a section becomes modified, I can rerender that section
    // Then if that section becomes bigger, that will effect later stuff
    // if that section becomes smaller, it will not

    // We want to tokenize the lines first because After filtering we may not get the correct grammer
    var lazyLines = this.tokenizeLines(_(this.state.lines),this.props.grammar)
    .filter(function(ret,child){
      console.log(currentYPos, scrollOffset);
      var min = currentYPos;
      if (min > scrollOffset + height) return false;
      var childHeight = this.computeHeight(child);
      var max = currentYPos += childHeight;
      if (max < scrollOffset) return false;
      if (offset === false){
        offset = height - (max - scrollOffset);
      }
      return true;
    }.bind(this));

    return <RowBox
      className="textLayer"
      style={{
        offset : {
          y : offset,x : -this.props.scroll.x
        }
      }}
    >{lazyLines.map(function(line){
      return <LinkedLine style={{ font : font }} >{line}</LinkedLine>;
    }).toArray()}</RowBox>;
  }
});
