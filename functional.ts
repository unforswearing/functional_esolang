// >> functional.ts;
// >> implementation of https://esolangs.org/wiki/Functional

// use readline to parse input files
// @todo this also needs a repl
import readline from "readline";

// grammar is a object of regex tokenizers for each language element
import language_grammar from "./grammar";

// --------------------------------------------
// contain language elements and types in a single namespace
declare namespace Language {
  // comparisons - true/false, -gt, -lt, etc
  export type ComparisonTypes = string | number | boolean;

  // words that cannot be used as a name for a user set function
  export type ReservedWords = string[];

  // arguments are immutable and can only be string|number|function
  export type UserArgumentType = Readonly<string | number | Function>;

  // user variables (functions) are stored as an array of json objects
  export type UserSetVariables = { [key: string]: UserArgumentType };

  // Language types from https://esolangs.org/wiki/Functional
  // dictating parameters for blocks runBlock({ print("this is a block" )})
  export type BlockType = RegExp;
  // bareword = unquoted word that does not refer to any function
  export type BarewordType = RegExp;
  // basic string checking
  export type StringType = RegExp;

  // make a little environment for user stuff
  export interface UserEnvironment {
    comparison_types: ComparisonTypes;
    reserved_words: ReservedWords;
  }

  // types for checking language features
  // immutable array of regex patterns
  export type PatternMatching = Readonly<{ [key: string]: RegExp }>;
  // the type container for tokenizer output
  export type TokenizeType = [Object[], string[], string[], string[], string[]];
  // the parser object is the final result of the tokenizer
  export type TokenizerParserObject = { [key: string]: RegExp };
  // the type container for the standard library
  export type StandardLibrary = Readonly<{ [key: string]: Function }>;

  // a development interface
  export interface Dev {
    pattern_matching: PatternMatching;
    tokenize_type: TokenizeType;
    standard_library: StandardLibrary;
  }
}

// --------------------------------------------
// most reserved words are builtin functions. see https://esolangs.org/wiki/Functional
const language_reserved: Language.ReservedWords = [
  "%",
  "nop",
  "print",
  "printf",
  "set",
  "rem",
  "if",
  "if_else",
  "loop",
  "while",
  "for",
  "function",
  "true",
  "false",
  "equals",
  "not_equals",
  "less_than",
  "less_or_equals",
  "greater_than",
  "greater_or_equals",
];

// --------------------------------------------
// bock and template checks and params
const language_patterns: Language.PatternMatching = {
  block_function_strings: /\"([a-zA-Z]|\s|\d)+"/g,
  block_function_split_lines: /\n+/g,
  split_on_function_and_block: /(\({|}\)|\(|\))+/g,
  printf_template_operator: /%/g,
};

// --------------------------------------------
/* everything is a function */
class UserSetFunctions implements Language.UserEnvironment {
  // check if vars are reserved/forbidden
  private isForbidden = (_: Boolean) => _ && false;
  private isReserved = (token: string): Boolean => {
    return Boolean(language_reserved.includes(token));
  };

  // make sure arguments are not reserved or forbidden
  private typesetArgument = (variable: any): Language.UserArgumentType => {
    let tmp: Language.UserArgumentType = variable;
    if (this.isForbidden(variable) || this.isReserved(variable)) {
      return variable;
    }
    return tmp;
  };

  // @todo a list of errors thrown from the interpreter
  error_types = {};
  // @todo this is not needed perhaps
  reserved_words = language_reserved;
  // @todo figure out what this does
  comparison_types = "%s";

  // establish the object to store user variables
  user_set_variables: Language.UserSetVariables = {};

  // @todo this needs to be completed
  get(name: string): Language.UserArgumentType {
    let returnVar = this.user_set_variables[name];
    return returnVar;
  }

  // set the variable and convert to type "UserArgumentType"
  set(
    name: string,
    value: Language.UserArgumentType
  ): Language.UserArgumentType {
    let varval: Language.UserArgumentType = this.typesetArgument(value);
    this.user_set_variables[name] = varval;
    return varval;
  }
}

// --------------------------------------------
// a tokenizer specifically to handle the edge cases for blocks
const blockTokenizer = (
  blockFunction: string
): Array<Language.ComparisonTypes> => {
  // let strings = blockFunction.match(language_patterns.block_function_strings);
  let splitLines = blockFunction
    .replace(language_patterns.block_function_split_lines, "")
    .split(" ");

  let getWords = splitLines.map((line) =>
    line.trim().split(language_patterns.split_on_function_and_block)
  );

  getWords.forEach((item) =>
    item.filter(Boolean).forEach((element, n) => {
      if (!element || element === "") item.splice(n, 1);
    })
  );

  // const tokens: Language.TokenizeType = [ [...getWords], [strings], [blocks], [barewords], [builtins] ]
  return getWords.flat().filter((item) => item !== "");
};

// --------------------------------------------
// @todo is this different from user_set_variables? why does that exist?
const Vars: UserSetFunctions = new UserSetFunctions();
// --------------------------------------------

const StandardLibrary: Language.StandardLibrary = {
  // --------------------------------------------
  // @todo needs validation to prevent dumb stuff
  print: (variable: any): void => {
    console.log(variable);
  },
  // --------------------------------------------
  // print a templated string (similar to bash / c printf)
  printf: (string: string, variable: any): void => {
    console.log(
      string.replace(language_patterns.printf_template_operator, variable)
    );
  },
  // --------------------------------------------
  // retrieve a user variable by "variable" name
  get: (variable: string): Language.UserArgumentType => {
    return Vars.get(variable);
  },
  // --------------------------------------------
  // set a user variable as "variable" "value"
  set: (
    variable: string,
    value: Language.UserArgumentType
  ): Language.UserArgumentType => {
    Vars.set(variable, value);
    return value;
  },
  // --------------------------------------------
  // comments. rem === remove for the interpreter
  rem: (string: string): Boolean => {
    return Boolean(string);
  },
  // --------------------------------------------
  // do absolutely nothing in all circumstances
  nop: () => null,
  // --------------------------------------------
  // if() without then or else, per spec
  // @todo this needs to be fleshed out
  if: (condition: Boolean, ifTrue: any) => {
    if (condition) {
      () => ifTrue;
    } else {
      return false;
    }
  },
  // --------------------------------------------
  // if using else, per spec
  // @todo this needs to be fleshed out
  if_else: (condition: Boolean, ifTrue: any, ifFalse: any) => {
    if (condition) {
      () => ifTrue;
    } else {
      () => ifFalse;
    }
  },
  // --------------------------------------------
  // implmenting loop() per spec
  // @todo needs to be fleshed out
  loop: (whileLooping: any) => {
    // parse loop body
    // @todo could use a grammar for this
    // see blockTokenizer above
    let blockTokens = blockTokenizer(whileLooping);

    // process each line in the loop block
    blockTokens.forEach((tok) => {
      return tok;
    });
  },
  // --------------------------------------------
  // while(), similar to loop. implemented per spec
  while: (condition: Boolean, whileTrue: any) => {
    // parse loop body,
    // @todo could use a grammar for this
    // see blockTokenizer above
    let blockTokens = blockTokenizer(whileTrue);

    // process each line in the loop block
    if (condition) {
      blockTokens.forEach((tok) => {
        return tok;
      });
    }
  },
  // --------------------------------------------
  // declare a function as "name" with args "args" and body "functionBody"
  // @todo this needs to be fleshed out
  function: (name: string, args: [any], functionBody: any) => {
    let tmp = new Function(...args);
    Vars.set(name, tmp.toString());
    return tmp;
  },
  // --------------------------------------------
  // combine a list of items into a single string
  // @todo this needs to be fleshed out / tested
  concat: (...items: [string | number]) => {
    return items.join(" ");
  },
  // --------------------------------------------
  // request user input
  // @todo this needs to be fleshed out and tested to make sure readline works
  input: (prompt: string) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(prompt, function () {
      rl.close();
    });
    rl.on("close", function () {
      process.exit(0);
    });
  },
  // --------------------------------------------
  try_catch: (tryBody: any, catchBody: any) => {
    if (() => tryBody) {
    } else {
      () => catchBody;
    }
  },
  // --------------------------------------------
  // equality test, using the type ComparisonTypes
  equal: (
    left: Language.ComparisonTypes,
    right: Language.ComparisonTypes
  ): boolean => {
    return left === right;
  },
  // --------------------------------------------
  // inequality test, using the type ComparisonTypes
  not_equal: (
    left: Language.ComparisonTypes,
    right: Language.ComparisonTypes
  ): boolean => {
    return left !== right;
  },
  // --------------------------------------------
  // if left is less than right
  less_than: (
    left: Language.ComparisonTypes,
    right: Language.ComparisonTypes
  ): boolean => {
    return left < right;
  },
  // --------------------------------------------
  // if left is less than or equal to right
  less_or_equal: (
    left: Language.ComparisonTypes,
    right: Language.ComparisonTypes
  ): boolean => {
    return left <= right;
  },
  // --------------------------------------------
  // if left is greater than right
  greater_than: (
    left: Language.ComparisonTypes,
    right: Language.ComparisonTypes
  ): boolean => {
    return left > right;
  },
  // --------------------------------------------
  // if left is greater than or equal to right
  greater_or_equal: (
    left: Language.ComparisonTypes,
    right: Language.ComparisonTypes
  ): boolean => {
    return left >= right;
  },
  // --------------------------------------------
};

//

const test = `
print("starting test of functional lang")
nop()
loop({
  set(thing, "this is a thing")
  print(thing())
})

function(anewfunc, print("this is a new function"))
function(add, a,b, a+b)

add(4, 7)
`;

/*
 * Tiny tokenizer
 * https://gist.github.com/borgar/451393/7698c95178898c9466214867b46acb2ab2f56d68
 *
 * - Accepts a subject string and an object of regular expressions for parsing
 * - Returns an array of token objects
 *
 * tokenize('this is text.', { word:/\w+/, whitespace:/\s+/, punctuation:/[^\w\s]/ }, 'invalid');
 * result => [{ token="this", type="word" },{ token=" ", type="whitespace" }, Object { token="is", type="word" }, ... ]
 *
 */
const reservedRegExp = new RegExp(`(${language_reserved.join("|")})`, "im");
function tokenize(
  s: string,
  parsers: Language.TokenizerParserObject,
  deftok: string
) {
  var m,
    r,
    l,
    t,
    tokens = [];
  while (s) {
    t = null;
    m = s.length;
    for (var key in parsers) {
      r = parsers[key].exec(s);
      // try to choose the best match if there are several
      // where "best" is the closest to the current starting point
      if (r && r.index < m) {
        t = {
          token: r[0],
          type: key,
          // matches: r.slice(1),
        };
        m = r.index;
      }
    }
    if (m) {
      // there is text between last token and currently
      // matched token - push that out as default or "unknown"
      tokens.push({
        token: s.substr(0, m),
        type: deftok || "unknown",
      });
    }
    if (t) {
      if (t.type !== "WHITESPACE") tokens.push(t);
      if (t.token.match(reservedRegExp) && t.type !== "STRING")
        t.type = "RESERVED";
      // push current token onto sequence
    }
    s = s.substr(m + (t ? t.token.length : 0));
  }
  return tokens;
}

// create an object of tokens from the test script above
let tokenArray = tokenize(
  test, //.replace(/\n+/g, " "),
  language_grammar,
  "INVALID"
);

console.log(tokenArray);

// loop through tokens and interpret / execute actions (no compilation)
// @todo need to decide how to parse these as simply as possible
for (let j = 0; j < tokenArray.length; j++) {
  // if reserved.includes(token) -> use the token to call the funtion directly
  // if type === BAREWORD -> search 'user_set_variables' to check if it has been declared
  // if not, throw an error
  //
  let entry = tokenArray[j];
  let token = entry.token;
  let tokType = entry.type;

  if (tokType === "INVALID") throw "INVALID";

  const lib = StandardLibrary;

  switch (tokType) {
    case "BAREWORD":
      console.log();
  }
}
