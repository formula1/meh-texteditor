var React = require('tambo');
var i = require('set-immediate');

var AbstractComponents = require('./AbstractComponents/index.jsx');

var RowBox = AbstractComponents.RowBox;
var Box = AbstractComponents.Box;

var Scrollable;

// NOTE: This needs to be implemented as a native element for each environment

module.exports = Scrollable = React.createClass({

  getInitialState : function(){
    return { scroll : { x : 0,y : 0 },isScrolling : false };
  },

  handleScroll : function(){
    var native = React.getNative(this);
    this.setState({
      isScrolling : true
    });
    setImmediate(function(){
      this.setState({
        isScrolling : false,
        scroll : {
          x : native.scrollLeft,
          y : native.scrollTop
        }
      });
    }.bind(this));
  },

  render : function(){
    var scroll = this.state.scroll;
    var viewport = this.props.viewport;
    var size = this.props.size;
    this.props.children.forEach(function(child){
      child.props.scroll = scroll;
      child.props.viewport = viewport;
    });
    console.log(size);
    return (<RowBox className='scrollable' style={{
        overflow : 'hidden',
        size : this.props.viewport,
        border : 'solid 1px black'
      }}
    >{[
      <Box
        style={{ overflow : 'auto',size : this.props.viewport }}
        onScroll={this.handleScroll.bind(this)}
      >
        <RowBox className='proxy-document' style={{ size : size }} />
      </Box>,
      <Box className='wrapper' style={{ size : viewport }} >{
        this.props.children.map(function(child){
          return <Box
            style={{ size : viewport, offset : { x : 0,y : 0 } }}
          >{child}</Box>;
        })
      }</Box>
    ]}</RowBox>);
  }
});
