var mpath = require('mpath');
var mathjs = require('mathjs');
var _ = require('lazy.js');
var normalizeConfig,argNormalizer,merge,areDiff;

var mergeInheritors;
module.exports.normalizeConfig = normalizeConfig = function(config,queryable){
  return mergeInheritors(config).map(function(listener){

    //normalizing arguments
    if (!listener.arguments){
      listener.arguments = [];
    }
    if (!(listener.arguments instanceof Array)){
      console.error('error silently caught');
      throw new Error('Arguments need to be an array type');
    }
    return {
      config : listener,
      filter : listener.filter,
      name : argNormalizer(queryable,listener.name),
      on : argNormalizer(queryable,listener.on || { evaluator : 'inherits' }),
      arguments : listener.arguments.map(argNormalizer.bind(void 0,queryable))
    };
  });
};

mergeInheritors = function(config){
  return config.reduce(function(array,obj){
    // handling all inheritence
    if (!obj.inheritors) return array.concat([obj]);

    var inheritors = obj.inheritors;
    delete obj.inheritors;
    var ret = array.concat(mergeInheritors(inheritors).map(function(inheritor){
      return _(inheritor).merge(obj).toObject();
    }));
    return ret;
  },[]);
};

areDiff = function(a,b){
  if (typeof b !== 'object'){
    return true;
  }

  if (typeof a !== 'object'){
    return true;
  }
  if (a instanceof Array !== b instanceof Array){
    return true;
  }
  return false;
};

merge = function(a,b){

  Object.keys(b).forEach(function(key){
    if (areDiff(a[key],b[key])){
      a[key] = b[key];
      return;
    }
    if (!(a[key] instanceof Array)){
      merge(a[key],b[key]);
      return;
    }
    if (a[key].length < b[key].length){
      a[key] = a[key].concat(b[key].slice(a[key].length));
    }
    merge(a[key],b[key]);
  });
};

module.exports.runFunction = function(fn,args){
  switch(fn.length){
    case 0: return fn();
    case 1: return fn(args[0]);
    case 2: return fn(args[0],args[1]);
    case 3: return fn(args[0],args[1],args[2]);
  }
};

module.exports.argNormalizer = argNormalizer = function(queryable,arg){
  if (typeof arg !== 'object' || arg === null || !('evaluator' in arg)){
    return function(){
      return arg;
    };
  }

  switch(arg.evaluator){
    case 'not' :
      return function(parentEvent,currentEvent,path){ return !mpath.get(path,currentEvent); };
    case 'inherits' :
      return function(parentEvent,currentEvent,path){
        return mpath.get(path,parentEvent);
      };
    case 'arguments':
      return function(){ return arguments[arg.which]; };
    case 'mathjs' :
      var val = mathjs.eval(arg.fn);
      return typeof val === 'function' ? function(parentEvent){
        return val(parentEvent.arguments[0]);
      } : function(){
        return val;
      };
    case 'mpath' :
      var query = arg.query;
      if (!arg.arguments){
        return function(){
          return mpath.get(query,queryable);
        };
      }
      var args = arg.arguments.map(argNormalizer.bind(void 0,queryable));
      return function(currentKey,isOn){
        return mpath.get(query,queryable).apply(void 0,
          args.map(function(fn){ return fn(currentKey,isOn); })
        );
      };
    case 'key' :
      var key = arg.key;
      if (!key) return function(parentEvent){ return parentEvent.on; };
      return function(parentEvent){
        return parentEvent.onKeys.indexOf(key) !== -1;
      };
    case 'charcode' :
      return function(parentEvent){
        return String.fromCharCode(parentEvent.event);
      };
    case 'map' : return function(parentEvent){
      return arg.map[parentEvent.arguments[0]];
    };
    case 'method' : return function(parentEvent){
      return parentEvent.arguments[0][arg.method]();
    };
  }
};
