var FirstMate = require('first-mate');

module.exports.construct = function(){
  this.grammerRegistry = new FirstMate.GrammerRegistry();
};

module.exports.loadGrammer = function(grammerConfig){
  if (!grammerConfig.maxTokensPerLine) grammerConfig.maxTokensPerLine = this.maxTokensPerLine
  var grammar = new Grammar(this.grammerRegistry, grammerConfig);
  return grammer;
};

module.exports.tokenizeLines = function(lines,grammer){
  var tags = [];
  var first = true;
  return lines.map(function(line){
    var res = grammer.tokenizeLine(line,tags,first);
    tags = res.tags;
    first = false;
    console.log(res);
    var tokens = registry.decodeTokens(res.line, res.tags)
    console.log(tokens);
    return res.line;
  });
};
  createGrammar: (grammarPath, object) ->
    object.maxTokensPerLine ?= @maxTokensPerLine
    grammar = new Grammar(this, object)
    grammar.path = grammarPath
    grammar
