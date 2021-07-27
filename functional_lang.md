It turns out my idea is a bit similar to the esolang called "Functional", so why not implement that?

[https://esolangs.org/wiki/Functional](https://esolangs.org/wiki/Functional)

Implementation details:

- everything is a function

## operator(s)

% - used in printf
- typical math operators

## builtin functions

print 
  - console.log(...)

printf
  - console.log(string.replace("%s", "value"))

set(var, value)
  - _langvars.push({name: var, val: value})

rem (comments)

nop (does nothing)

if(condition, code)

if_else(condition, code, else)
  - if(condition){code}else{else}

loop(code) - infinite loop, no indexes

while(condition, code) - a while loop

!! not implementing for loops right now
for(init, condition, increment, code)

function(name, ...args, code)

## implied builtin functions
>> these were in the spec examples but not actually specified

concat(a,b,...)
input()
try_catch(code, catch)
equal(a,b) 

## functions not available or implied in the spec
>> other comparison functions were not listed, but should be added

not_equal(a,b)
less_than(a,b)
less_or_equal(a,b)
greater_than(a,b)
greater_or_equal(a,b)

## types
Barewords - unquoted string or numbers, similar to identifiers
Strings - quoted with "" or ''
(code) Blocks - code enclosed with curly braces {}

## language grammar

use the regex from grammar.ts to tokenize code
