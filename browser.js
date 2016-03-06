var Tembo = require('tambo');
var DOMRenderer = require('tambo/src/renderers/DOM');
var CodeMirror = require('./lib/Components/index.jsx');
var FirstMate = require('first-mate');
var Grammar = FirstMate.Grammar;
var javascriptScope = require('./lib/plugins/javascript.grammar.json');
var regexpScope = require('./lib/plugins/javascript-regexp.grammar.json');
var htmlScope = require('./lib/plugins/html.grammar.json');

var fs = require('fs');

module.exports = function(){
  var tembo = new Tembo(DOMRenderer);
  var registry = new FirstMate.GrammarRegistry();
  registry.addGrammar(new Grammar(registry,javascriptScope));
  registry.addGrammar(new Grammar(registry,regexpScope));
  registry.addGrammar(new Grammar(registry,htmlScope));
  var textEditor = tembo.render(
    tembo.createElement(
      CodeMirror,{
        registry : registry,
        font : {
          size : 16
        },
        theme : {
          selectColor : 'red'
        },
        width : 300,
        height : 300
      },fs.readFileSync(__dirname + '/lib/browser-config.js','utf8')
    ),document.querySelector('#content')
  );
  console.log(textEditor);
  textEditor.setGrammar('source.js');
};
