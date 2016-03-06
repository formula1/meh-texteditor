
var React = require('tambo');

var Cursor = require('../Stores/Cursor');
var WrappedLines = require('../Stores/WrappedLines');

var browserConfig = require('../browser-config');
var TextUtil = require('../Util/text');
var ThemeUtil = require('../Util/theme');
var KeyEmitter = require('../Stores/KeyEmitter');

var Scrollable = require('./Scrollable.jsx');
var CursorLayer = require('./CursorLayer.jsx');
var TextLayer = require('./TextLayer/index.jsx');

var FirstMate = require('first-mate');

var CodeMirror;

module.exports = CodeMirror = React.createClass({

  getInitialState : function(){
    return {
      theme : ThemeUtil.normalizeTheme(this.props.theme),
      font : {
        font : this.props.font.size + ' monospace',
        lineHeight : this.props.font.size,
        charWidth : TextUtil.getFontWidth(this.props.font.size + ' monospace')
      }
    };
  },

  componentWillMount : function(){
    var text = this.props.children[0] || '';
    var lineStore = this.lineStore = new WrappedLines(text,{
      maxLength : 0,
      font : this.state.font
    });

    this.keyboard = new KeyEmitter();
    this.keyboard.addKeyMapping(require('../plugins/default-keymap.json'));

    var lines = this.lineStore.getLines();
    var cursor = this.cursor = new Cursor(lines);
    lineStore.on('update',cursor.setLines.bind(cursor));
    cursor.on('lines',lineStore.setLines.bind(lineStore));
    lineStore.on('update',this.sizeUpdater.bind(this));
    this.sizeUpdater();
  },

  componentWillUnmount : function(){
    this.keyboard.destroy();
  },

  sizeUpdater : function(){
    var lines = this.lineStore.getLines();
    var size = TextUtil.calculateSize(lines,this.state.font);
    this.setState({
      size : size,
      lines : lines
    });
  },

  setGrammar : function(scopeName){
    var grammar = this.props.registry.grammarForScopeName(scopeName);
    if (!grammar) throw new Error('the grammar does not exist');
    this.setState({ grammar : grammar });
  },

  render : function(){
    return <Scrollable
      className="CodeMirror"
      viewport={{ x : this.props.width,y : this.props.height }}
      size={this.state.size}
    >{[
      <TextLayer
        theme={this.state.theme}
        font={this.state.font}
        lineStore={this.lineStore}
        grammar={this.state.grammar}
      />,

      // Always have Cursor Layer last to avoid zindex complexities
      <CursorLayer
        theme={this.state.theme}
        font={this.state.font}
        cursor={this.cursor}
        keyboard={this.keyboard}
      />
    ]}</Scrollable>;
  }
});
