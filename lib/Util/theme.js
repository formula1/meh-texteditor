
var Color = require('color-js');

var normalizeColor;
module.exports.normalizeTheme = function(theme){
  theme.selectColor = normalizeColor(theme.selectColor);

  return theme;
};

module.exports.formatStyle = function(type,style){
  switch(type.toLowerCase()){
    case 'dom': return {
      color : style.textColor,
      backgroundColor : style.backgroundColor,
      font : `${style.font.size}px monospace`,
      lineHeight : style.font.lineHeight,
      wordWrap : false
    };
  }
};

normalizeColor = function(color){
  if (color instanceof Array) return Color(color);
  return Color(color);
};
