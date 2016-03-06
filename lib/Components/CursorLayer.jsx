var React = require('tambo');
var TextUtil = require('../Util/text');
var AbstractComponents = require('./AbstractComponents/index.jsx');
var Box = AbstractComponents.Box;

var CursorLayer;

var Cursor;

module.exports = CursorLayer = React.createClass({

  getInitialState : function(){
    return {
      position : this.props.cursor.position,
      min : this.props.cursor.min,
      max : this.props.cursor.max
    };
  },
  componentDidMount : function(){
    React.getNative(this).focus();
  },

  componentWillMount : function(){
    this.props.keyboard.on('data',this.feedKeyToCursor);
    this.props.cursor.on('update',this.updatePosition);
  },

  feedKeyToCursor : function(event){
    var cursor = this.props.cursor;
    var keyEmitter = this.props.keyboard;
    switch(event.event){
      case 'shift' : return this.handleKeySelecting(event.on);
      case 'backspace': return cursor.delete(false,keyEmitter.isOn('shift'));
      case 'delete': return cursor.delete(true,keyEmitter.isOn('shift'));
      case 'newline': return cursor.newLine();
      case 'end' : return cursor.update(cursor.currentLine.length,null);
      case 'home' : return cursor.update(0,null);
      case 'pageup' : return cursor.move(0,-1,true);
      case 'pagedown' : return cursor.move(0,1,true);
      case 'left' : return cursor.move(1,0,keyEmitter.isOn('shift'));
      case 'up' : return cursor.move(0,1,keyEmitter.isOn('shift'));
      case 'right' : return cursor.move(0,-1,keyEmitter.isOn('shift'));
      case 'down' : return cursor.move(0,1,keyEmitter.isOn('shift'));
      case 'number' : return cursor.add(event.arguments[0].toString());
      case 'alphabet' : return cursor.add(event.arguments[0].toString());
      case 'special_characters' : return cursor.add(event.arguments[0].toString());
    }
  },

  componentWillRecieveProps : function(props){
    if (props.cursor !== this.props.cursor){
      this.props.cursor.removeListener('update',this.updatePosition);
      this.props.cursor.on('update',this.updatePosition);
    }
  },

  componentWillUnmount : function(){
    this.props.cursor.removeListener('update',this.updatePosition);
    this.props.keyboard.removeListener('data',this.feedKeyToCursor);
  },

  updatePosition : function(){
    this.setState({
      min : this.props.cursor.min,
      max : this.props.cursor.max,
      position : this.props.cursor.position
    });
  },

  handleMouseDown : function(pos){
    console.log('down')
    pos = TextUtil.pointToLineCol(pos,this.props.font,this.props.scroll);
    this.props.cursor.update(pos.x,pos.y);
    this.handleSelectToggle(true);
  },

  handleMouseMove : function(pos){
    if (!this.state.isSelecting) return;
    pos = TextUtil.pointToLineCol(pos,this.props.font,this.props.scroll);
    this.props.cursor.update(pos.x,pos.y);
  },

  handleMouseUp : function(){
    console.log('up')
    this.handleSelectToggle(false);
  },

  handleKeySelecting : function(boo){
    this.isKeySelecting = boo;
    if (boo){
      if (!this.isMouseSelecting){
        this.props.cursor.setSelecting(true);
        this.setState({ isSelecting : true });
      }
    }else if (!this.isMouseSelecting){
      this.props.cursor.setSelecting(false);
      this.setState({ isSelecting : false });
    }
  },
  handleSelectToggle : function(boo){
    this.isMouseSelecting = boo;
    if (boo){
      React.getNative(this).focus();
      if (!this.isKeySelecting){
        this.props.cursor.setSelecting(true);
        this.setState({ isSelecting : true });
      }
    }if (!this.isKeySelecting){
      this.props.cursor.setSelecting(false);
      this.setState({ isSelecting : false });
    }
  },

  handleKeyDown : function(e){
    this.props.keyboard.keyDown(e.keyCode);
  },

  handleKeyUp : function(e){
    this.props.keyboard.keyUp(e.keyCode);
  },

  render : function(){
    console.log(this.props.viewport);
    var lines = this.props.cursor.lines;
    var selectColor = this.props.theme.selectColor;
    var selections = this.props.isSelecting ?
      TextUtil.selectionToArray(this.state.min,this.state.max,lines) : [];
    var _this = this;
    return <Box
      className="cursorLayer"
      onKeyDown={function(e){
        _this.handleKeyDown(e);
      }}
      onKeyUp={function(e){
        _this.handleKeyUp(e);
      }}
      tabIndex="1"
      onMouseDown={this.handleMouseDown}
      onMouseUp={this.handleMouseUp}
      onMouseMove={this.handleMouseMove}
      style={{ size : this.props.viewport }}
    >{
      [<Cursor
        font={this.props.font}
        scroll={this.props.scroll}
        position={this.state.position}
      />].concat(selections.map(function(sel){
        return <Box
          style={{
            offset :  TextUtil.lineColToPoint(sel,font,scroll),
            size : {
              x : sel.length * font.charWidth,
              y : font.lineHeight
            }
          }
        } />;
      }))
    }</Box>;
  }
});

Cursor = React.createClass({
  getInitialState : function(){
    return { blinking : true };
  },
  componentWillMount : function(){
    this.blinkInterval = setInterval(function(){
      this.setState({ blinking : !this.state.blinking });
    }.bind(this),500);
  },
  componentWillUnmount : function(){
    clearInterval(this.blinkInterval);
  },
  render : function(){
    var pos = TextUtil.lineColToPoint(
      this.props.position,this.props.font,this.props.scroll
    );
    return <Box className="cursor"
      style={{
        offset : pos,
        bgColor : [0,0,0,this.state.blinking ? 255 : 0],
        size : {
          x : 1,
          y : this.props.font.lineHeight //this.props.font.lineHeight
        }
      }}
    />;
  }
});
