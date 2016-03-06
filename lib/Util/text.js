var NEWLINE = /\n/g;
var WORD_BOUNDRY = /\s/;

var private = {};

var TextUtil = module.exports;

module.exports.getFontWidth = function(font){
  if (typeof window !== 'undefined' && Element){
    // re-use canvas object for better performance
    if (!private.canvas) private.canvas = document.createElement('canvas');
    var canvas = private.canvas;
    var context = canvas.getContext('2d');
    context.font = font;
    var metrics = context.measureText('O');
    console.log(metrics);
    return metrics.width;
  }
};

module.exports.splitLines = function(text){
  return text.split(NEWLINE);
};

module.exports.pointToLineCol = function(point,font,scroll){
  if (!scroll) scroll = { x : 0,y : 0 };

  // This might be more clean with chaining
  return {
    x : Math.floor((point.x + scroll.x) / font.charWidth),
    y : Math.floor((point.y + scroll.y) / font.lineHeight)
  };
};

module.exports.lineColToPoint = function(linecol,font,scroll){
  if (!scroll) scroll = { x : 0,y : 0 };

  // This might be more clean with chaining
  return {
    x : linecol.x * font.charWidth - scroll.x,
    y : linecol.y * font.lineHeight - scroll.y
  };
};

module.exports.calculateSize = function(lines,font){
  console.log(font.lineHeight);
  console.log(font);
  var lineHeight = font.lineHeight;
  var charWidth = font.charWidth;
  return lines.reduce(function(max,line){
    return {
      x : Math.max(max.x,line.length * charWidth),
      y : max.y + lineHeight
    };
  },{ x : 0,y : 0 });
};

module.exports.nextWordBound = function(text,curpos,backward){
  curpos = Math.max(0,Math.min(text.length-1,curpos));
  if (backward){
    var i = curpos;
    do{
      if (WORD_BOUNDRY.test(text[i])) break;
    }while(i--);
    return i;
  }else{
    for(var i=curpos,l=text.length; i<l; i++){
      if (WORD_BOUNDRY.test(text[i])) break;
    }
    if (i > l) return -1;
    return i;
  }
};

module.exports.selectionToArray = function(min,max,lines){
  var curSelection;
  var selections = [];
  curSelection = min;

  while(min.y < max.y){
    var text = lines[min.y];
    curSelection.length = text.length - min.x;
    selections.push(curSelection);
    min.y++;
    min.x = 0;
    curSelection = min;
  }

  curSelection.length = max.x - min.x;
  selections.push(curSelection);

  return selections;
};
