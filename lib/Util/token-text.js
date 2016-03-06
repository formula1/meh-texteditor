

module.exports.tokenizeLines = function(lines,grammar,registry){
  var tags = [];
  var first = true;
  return lines.map(function(line){
    var res = grammar.tokenizeLine(line,tags,first);
    tags = res.tags;
    first = false;
    console.log(res);
    var tokens = registry.decodeTokens(res.line,res.tags);
    console.log(tokens);
    return res.line;
  });
};
