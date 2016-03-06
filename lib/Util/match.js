
var matches,matchObj,matchArray,matchSequence,
allUniquePossible,matchString,matchNumber,curry,passesEnough,equal,not;
module.exports.anyMatchesTest = matches = function(obj,tester){
  var tt = typeof tester;
  if (tt !== 'object') return equal(obj,tester);
  if (tt === null) return equal(obj,tester);
  if ('is' in tester) return tester.is;
  if ('not' in tester && matches(obj,tester.not)) return false;
  delete tester.not;
  if (Object.keys(tester).length === 0) return true;

  // if any passes,we can continue cleanly
  if ('or' in tester && !passesEnough(tester.or,curry(matches,obj))) return false;
  delete tester.or;
  if (Object.keys(tester).length === 0) return true;

  // if any passes,we can continue cleanly
  if ('and' in tester && passesEnough(tester.and,not(curry(matches,obj)))) return false;
  delete tester.and;
  if (Object.keys(tester).length === 0) return true;

  if ('passes' in tester){
    var limit = tester.passes.limit;
    var queries = tester.passes.queries;
    if (!passesEnough(queries,curry(matches,obj),limit)){
      return false;
    }
    delete tester.passes;
    if (Object.keys(tester).length === 0) return true;
  }

  var to = typeof obj;
  if (to !== 'object'){
    if (tester.expects !== to) return false;
    delete tester.expects;
    if (Object.keys(tester).length === 0) return true;
    switch(to){
      case 'string' : return matchString(obj,tester);
      case 'number' : return matchNumber(obj,tester);
      case 'undefined' :
        throw new Error('recieved undefined');
    }
  }

  if (obj instanceof Array){
    if (tt !== 'object') return false;
    return matchArray(obj,tester);
  }

  return matchObj(obj,tester);
};

module.exports.matchString = matchString = function(input,tester){
  if ('regexp' in tester){
    var regexp = new RegExp(tester.regexp);
    return regexp.test(input);
  }

  return false;
};

module.exports.matchString = matchNumber= function(input,tester){
  if ('lt' in tester && input >= tester.lt) return false;
  if ('gt' in tester && input <= tester.gt) return false;
  if ('lte' in tester && input > tester.lte) return false;
  if ('gte' in tester && input < tester.gte) return false;
  return true;
};

matchObj = function(input,tester){
  return !Object.keys(tester).some(function(key){
    // if the filter passes,we exit early
    if (!(key in input)) return true;
    return !matches(input[key],tester[key]);
  });
};

module.exports.matchArray = matchArray = function(input,tester){
  if (tester instanceof Array){
    return matchSequence(input,tester);
  }
  if ('any' in tester && !passesEnough(input,curry(matches,void 0,tester.any))){
    return false;
  }
  delete tester.any;
  if (Object.keys(tester).length === 0) return true;

  if ('has' in tester && !passesEnough(input,curry(matches,void 0,tester.has))){
    return false;
  }
  delete tester.has;
  if (Object.keys(tester).length === 0) return true;

  if ('all' in tester && passesEnough(input,not(curry(matches,void 0,tester.all)))){
    return false;
  }
  delete tester.all;
  if (Object.keys(tester).length === 0) return true;

  if ('enough' in tester){
    var limit = tester.enough.limit;
    var query = tester.enough.query;
    if (!passesEnough(input,curry(matches,void 0,query),limit)){
      return false;
    }
  }

  if ('ensure' in tester){
    if (passesEnough(input,function(item){
      return passesEnough(curry(not(matches),item),tester.ensure);
    })) return false;
  }

  if ('intersects' in tester){
    if (!passesEnough(input,function(item){
      return passesEnough(curry(matches,item),tester.ensure);
    })) return false;
  }

  return true;
};

/*

Way it works is....

Starts with
- Makes first sequences failure a complete failure

Ends With (maybe possible to try and hit it from both ends)
- Makes final Sequences failure a complete failure

Run Rule(array,i)
- rules = Look ahead until you hit a breaking point
- Use these items to test a block of values
- When it doesn't match
- Run Rule (array i + rules.length);

RegExp rules
- StartsWith

- Maybe - 0 or 1 times (just repetiton)

- Repeats
  - can be a range,a number or a possible number
    - with possible number
  - 0 to infinite times



-EndsWith
*/

var getRule,runRule;
module.exports.matchSequence = function(inputSequence,testSequence){

  var ruleMap = [];
  var start = getRule(testSequence,0);
  testSequence = testSequence.slice(start.sequence.length);
  var validRules = [];
  if (!('startsWith' in testSequence[0])){
    ruleMap[1] = start;
    ruleMap.push({
      min : 0,max : 'infinity',sequence : [{ is : true }]
    });
    ruleMap.push(start);
    start.ruleIndex++;
    start = ruleMap[0];
  }

  function findOrMakeNextRule(rule){
    if (rule.isEnd) return false;
    if (ruleMap.length === rule.ruleIndex + 1){
      var nextRule = getRule(testSequence,rule.ruleIndex + 1);
      ruleMap.push(nextRule);
      testSequence = testSequence.slice(nextRule.sequence.length);
    }
    return JSON.parse(JSON.stringify(ruleMap[rule.ruleIndex + 1]));
  }

  start.isStarter = true;
  var validRules = [];
  var endFinishedHappy = false;
  try{
    inputSequence.reduce(function(currentValid,input){
      if (currentValid.length === 0) throw 'sequenceMatch: no more matchers';
      return currentValid.reduce(function(nextValid,rule){
        while(rule){
          var result = runRule(rule,input);
          if (result !== -1) break;
          if (result.isEnd) throw 'sequenceMatch: have inputs after end';

          // if we get a result of negative it means that we have been satisified but
          // we can no longer accept characters
          // as a result,the current input should be considered to be for the next test
          // this will happen so long as there is a rule
          rule = findOrMakeNextRule(rule);
        }
        if (!rule){
          throw 'ok';
        }

        switch(result){
          // If the result never made it to the minimum then the next rule can't trigger
          case -2:
            if (rule.isStarter) throw 'sequenceMatch: start cannot fail,only disappear';
            if (rule.isEnd) endFinishedHappy = false;
            return nextValid;
          case 0:
            if (rule.isEnd) endFinishedHappy = false;
            return nextValid.concat([rule]);
          case 1:
            if (rule.isEnd) endFinishedHappy = true;
            return nextValid.concat([rule,findOrMakeNextRule(rule)]);
        }
      },[start]);
    },validRules);
  }catch(e){
    if (typeof e !== 'string') throw e;
    if (!/^sequenceMatch: /.test(e)) throw e;
    return false;
  }

  return endFinishedHappy;
};

getRule = function(testSequence,ruleIndex){
  if (testSequence.length === 0){
    return {
      sequence : [{ is : true }],
      min : 0,
      max : 'infinity',
      offset : 0,
      repetition : 0,
      ruleIndex : ruleIndex,
      consumed : [],
      isEnd : true
    };
  }
  var strip = [];
  var test;
  var limit;
  for(var i = 0; i < testSequence.length; i++){
    test = testSequence[i];
    if (typeof test !== 'object') strip.push(test);
    if ('limit' in test){
      limit = test.limit;
      break;
    }
    strip.push(test);
  }

  var min = !limit ? 1 : typeof limit.min === 'number' ? limit.min : 1;
  var max = !limit ? min : limit.max === 'infinity' ? Number.POSITIVE_INFINITY : limit.max || min;

  return {
    sequence : strip,
    min : min,
    max : max,
    offset : 0,
    repetition : 0,
    ruleIndex : ruleIndex,
    consumed : [],
    isEnd : i === testSequence.length && test.end
  };
};

runRule = function(rule,input){
  if (rule.offset === rule.strip.length){
    rule.repitions++;
    if (rule.repitions === rule.max) return -1;
    if (rule.repitions > rule.max) return -2;
    rule.offset = 0;
  }
  if (!matches(rule.sequence[rule.offset++],input)){
    return rule.repitions >= rule.min ? -1 : -2;
  }
  rule.consumed.push(input);
  return rule.repitions >= rule.min && rule.offset === rule.sequence.length ? 1 : 0;
};

module.exports.equal = equal = function(a,b){
  var atype = typeof a;
  if (atype !== typeof b) return false;
  if (atype !== 'object') return a === b;
  if (a === null || b === null) return a === b;
};

module.exports.not = not = function(evaluate){
  if (typeof evaluate === 'boolean') return !evaluate;
  return function(a,b){
    return !evaluate(a,b);
  };
};

module.exports.curry = curry = function(fn,a,b){
  return function(arg){
    return fn(a == void 0 ? arg : a,a == void 0 ? b : arg);
  };
};

module.exports.passesEnough = passesEnough = function(list,evaluate,limit){
  var count = 0;
  if (limit === void 0) limit = 1;
  return list.some(function(item){
    if (evaluate(item)) count++;
    return count >= limit;
  });
};

// this is similar to sudoku
// attempting to have unique pairings between both input and matches
// the problem starts arrising when
// [abc,d,e,f], [a,b,c,d]
// technically this worked since
// - a is only satisified by 1, b is only satisfied by 1 and c is only satisfied by 1
// if we do the reverse we now run into an issue where e and f are unsatsified all
// have the same satisfaction
// [ab,ab,abc,de,ef,fab], [ab,bc,cd,ef,dbe]
// How many ways can this be satisfied?
// - 6 must be e because db are satsified and neither a nor b are matching
// - a, b, c, f, e
// - 2 must be be because 3 doesn't have a d to be capable of satisfying
//
// [a,b,c,d,e,f,g], [abc,bcd,dab,cef,gef,gae];
// [1,2,3],[2,3,4],[1,2,4],[3,5,6],[5,6,7][1,5,7]
// 1, ?, [2,4], ?,?,[5,7] -> branch
// 1, [2,3,4], [2,4], [3,6], [6,7], 5 ->
// 1, [2,3,4], [2,4], [3,6], [6,7], 5
// matches are unique
module.exports.allUniquePossible = allUniquePossible = function(evaluate,limit,inputs,matches){
  var notUniqueMatches = new Set(matches);
  var notUniqueInputs = new Set(inputs);
  var inputsToMatches = new Map();
  var matchesToInputs = new Map();
  var uniqueInputToMatches = new Map();

  var setAToB,setSingleMatch;

  setSingleMatch = function(input,match){
    notUniqueMatches.remove(match);
    notUniqueInputs.remove(input);
    uniqueInputToMatches.set(input,match);
    var others = matchesToInputs.get(match);
    matchesToInputs.remove(match);
    if (others.size() === 1) return;
    for(var other of others){
      var otherMatches = inputsToMatches.get(other);
      otherMatches.remove(match);
      if (otherMatches.size() === 0){
        throw new Error('no possibilities for this input');
      }
      if (otherMatches.size() === 1){
        setSingleMatch(other,otherMatches.get(0));
      }
    }
  };

  inputs.forEach(function(input){
    var s = new Set();
    for(var match of notUniqueMatches){
      if (evaluate(input,match)){
        s.add(match);
        if (!matchesToInputs.has(match)){
          matchesToInputs.set(match,new Set());
        }
        matchesToInputs.get(match).add(input);
      }
    }
    if (s.size() === 0){
      throw new Error('no possibilities available for this input');
    }
    if (s.size() === 1){
      var match = s.get(0);
      setSingleMatch(input,match);
    }
  });

  function setSingleInput(input,match){
    notUniqueMatches.remove(match);
    notUniqueInputs.remove(input);
    uniqueInputToMatches.set(input,match);
    var matches = inputsToMatches.get(input);
    inputsToMatches.remove(input);
    if (matches.size() === 1) return;
    for(var other of matches){
      var otherInputs = matchesToInputs.get(other);
      otherInputs.remove(input);
      if (otherInputs.size() === 0){
        throw new Error('no possibilities for this input');
      }
      if (otherInputs.size() === 1){
        setSingleInput(otherInputs.get(0),other);
      }
    }
  }

  function tryToTriggerChain(A,listA,listB,sequence,all){
    var Bs = listA.get(A);
    for(var B of Bs){
      var queued = new Map();
      var tempA = new Set(listA);
      var tempB = new Set(listB);
      var localSequence = sequence.slice(0);
      try{
        setAToB(A,B,tempA,tempB,localSequence,queued,all);
      }catch(e){
        console.log('found an impossibility',e);
      }
      for(var item of queued.values()){
        tryToTriggerChain(item[0],item[1],item[2],localSequence,all);
      }
    }
  }

  setAToB = function(A,B,listA,listB,sequence,queued,all){
    queued.remove(A);
    var Bs = listA.get(A);
    if (Bs.size() === 1) throw sequence;
    if (Bs.size() === 1){
      if (Bs.get(0) !== A) throw sequence;
      return;
    }else{
      var As = listB.get(B);
      if (As.size() > 1){
        sequence.push([A,B]);
      }
      Bs.remove(B);
      listA.set(A,new Set([B]));
      setAToB(B,A,listB,listA,sequence,queued,all);
    }
    var queued = new Set();
    for(var oB of Bs){
      var oAs = listB.get(oB);
      oAs.remove(A);
      if (oAs.size() === 0) throw sequence;
      if (oAs.size() === 1){
        setAToB(oAs.get(0),oB,listA,listB,sequence,queued,all);
        continue;
      }
      queued.set(oB,[oB,listB,listA]);
    }

    if (queued.size() === 0){
      return all.push(sequence);
    }
  };

  Array.form(notUniqueMatches.values()).forEach(function(match){
    var inputs = matchesToInputs.get(match);
    if (inputs.size() === 1){
      var input = inputs.get(0);
      setSingleInput(input,match);
    }
  });
  if (notUniqueMatches.size() === 0){
    return [inputs.map(function(input){
      return { input : input,match : inputsToMatches.get(input).get(0) };
    })];
  }
  var all = [];
  tryToTriggerChain(inputs[0],notUniqueInputs,notUniqueMatches,[],all);
  return all.map(function(sequence){

    return sequence.map(function(ab){
      return notUniqueInputs.has(ab[0]) ?
        { input : ab[0],match : ab[1] } :
        { input : ab[1],match : ab[0] };
    }).concat(Array.from(uniqueInputToMatches.keys()).map(function(input){
      return { input : input,match : uniqueInputToMatches.get(input).get(0) };
    }));
  });
};

  /*

    They have many matches,but it isn't circular
    [123],[13],[12]
    [123],[13],[12]
    - [1,3,2],[1,3,2]
      - [1--],[1--]
      - remove 1s ffrom the second list
      - [1--],[13-]
      - sets off a chain
      - [1-2],[13-]
      - remove 2s from the first list (does nothing)
      - remove 3s from the first second (does nothing)
      - [1-2],[13-]
      - continue removing 1s
      - [1-2],[132]
      - sets off chain
      - [132],[132]
      - remove 3s from the first list (does nothing)
      - remove 2s from the second list (does nothing)
      - remove 1s from the first list (does nothing)

    - [2,3,1],[3,1,2]
      - I see a pattern here
      - I assume that since
        - there is only three distinct values for the first item
        - This is a closed loop
        - the last form of '2' caused a chain and set the other array to 3
        - Both arrays have nearly identical structures
        - I can assume that 3 will also cause a chain
    -
      - Set first item to 2
      [2,-,-],[-,-,-]
      -sets off chain
      [2,-,-],[-,1,-]
      - Remove 1s from second list
      [2,-,-],[-,1,2]
      - sets off chain
      [2,3,-],[-,1,2]
      - Remove 3 from first list (does nothing)
      - Remove 2s from second list
      [2,3,-],[3,1,2]
      - sets off chain
      [2,3,1],[3,1,2]
      - Remove 1s from first list (does nothing)
      - Remove 3s from second list (does nothing)

  */

/*

  Issue,there is usually a definitive weakest link that reduces the total amount of guesses
  There are generally strongest links that don't reduce it as much
  Then there are circular patterns that don't seem to matter
*/

/*

- We find one that is unique
  - We add that to the isUnique Array
- Each one after is removed
  - We chec

*/
