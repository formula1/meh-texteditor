var Transform = require('stream').Transform;
var ConfigUtil = require('../../Util/config');
var MatchUtil = require('../../Util/match');
var KeyEmitter;

module.exports = KeyEmitter = function(){
  Transform.call(this,{
    readableObjectMode : true,
    writableObjectMode : true
  });
  this.keyListeners = [];
  this.keysDown= {};
  this.on('end',function(){
    clearInterval(this.repeatInterval);
  }.bind(this));
};

KeyEmitter.prototype = Object.create(Transform.prototype);
KeyEmitter.prototype.constructor = KeyEmitter;

KeyEmitter.prototype.addKeyMapping = function(config){
  this.keyListeners = this.keyListeners.concat(ConfigUtil.normalizeConfig(config));
  this.keyListeners .sort(function(a,b){
    return (b.priority || 0) - (a.priority || 0);
  });
};

KeyEmitter.prototype.isOn = function(key){
  return key in this.keysDown;
};

KeyEmitter.prototype._transform = function(chunk,encoding,done){
  console.log('TRIGGERING EVENT: ',chunk);

  chunk.onKeys = Object.keys(this.keysDown);
  var possible = this.keyListeners.filter(function(listener){
    return MatchUtil.anyMatchesTest(chunk,JSON.parse(JSON.stringify(listener.filter)));
  });

  console.log('EVENTS TO TRIGGER : ',possible);

  if (!possible.some(function(listener){
    console.log(listener);
    var eventName = ConfigUtil.runFunction(listener.name,chunk,'name');
    var nextEvent = {
      event : eventName,
      on : ConfigUtil.runFunction(listener.on,[
        chunk,
        { event : eventName,on : eventName in this.keysDown },
        'on'
      ])
    };

    if (listener.save && nextEvent.on){
      this.keysDown[eventName] = listener.dontRepeat ? -1 : Date.now() + 500;
    }else if (listener.save && !nextEvent.on){
      delete this.keysDown[nextEvent];
    }
    nextEvent.arguments = listener.arguments.map(function(fn,i){
      return ConfigUtil.runFunction(fn,[chunk,nextEvent,'arguments.'+i]);
    });
    this.write(nextEvent);
    return listener.capture;
  }.bind(this))) this.push(chunk);
  done();
};

KeyEmitter.prototype.keyDown = function(keyCode){
  if (keyCode in this.keysDown) return;

  this.write({
    event : keyCode,
    on : true
  });

  this.interval();
};

KeyEmitter.prototype.keyUp = function(keyCode){
  delete this.keysDown[keyCode];
  this.write({
    event : keyCode,
    on : false
  });
  this.interval();
};

KeyEmitter.prototype.interval = function(){
  var keysDown = this.keysDown;
  var validKeys = Object.keys(this.keysDown).filter(function(key){
    return keysDown[key] > -1;
  });
  if (validKeys.length === 0){
    if (!this.repeatInterval) return;
    clearInterval(this.repeatInterval);
    this.repeatInterval = void 0;
    return;
  }

  if (this.repeatInterval) return;
  this.repeatInterval = setInterval(function(){
    var now = Date.now();
    Object.keys(keysDown).filter(function(key){
      return keysDown[key] > -1 && now - keysDown[key] > 0;
    }).sort(function(a,b){
      return keysDown[a] - keysDown[b];
    }).forEach(function(key){
      this.write({
        key : key,
        on : true
      });
    }.bind(this));
  }.bind(this),100);

  return true;
};
