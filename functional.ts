// >> functional.ts;
// >> implementation of https://esolangs.org/wiki/Functional
import readline from "readline";
import language_grammar from "./grammar";

// --------------------------------------------
declare namespace Language {
  export type ComparisonTypes = string | number | boolean;
  export type ReservedWords = string[];
  export type UserArgumentType = Readonly<string | number | Function>;
  export type UserSetVariables = { [key: string]: UserArgumentType };

  export type BlockType = RegExp;
  export type BarewordType = RegExp;
  export type StringType = RegExp;

  export interface UserEnvironment {
    comparison_types: ComparisonTypes;
    reserved_words: ReservedWords;
  }

  export type PatternMatching = Readonly<{ [key: string]: RegExp }>;
  export type TokenizeType = [Object[], string[], string[], string[], string[]];
  export type TokenizerParserObject = { [key: string]: RegExp };
  export type StandardLibrary = Readonly<{ [key: string]: Function }>;

  export interface Dev {
    pattern_matching: PatternMatching;
    tokenize_type: TokenizeType;
    standard_library: StandardLibrary;
  }
}

// --------------------------------------------
const language_reserved: Language.ReservedWords = [
  "%",
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
const language_patterns: Language.PatternMatching = {
  block_function_strings: /\"([a-zA-Z]|\s|\d)+"/g,
  block_function_split_lines: /\n+/g,
  split_on_function_and_block: /(\({|}\)|\(|\))+/g,
  printf_template_operator: /%/g,
};

// --------------------------------------------
/* everything is a function */
class UserSetFunctions implements Language.UserEnvironment {
  private isForbidden = (_: Boolean) => _ && false;
  private isReserved = (token: string): Boolean => {
    return Boolean(language_reserved.includes(token));
  };

  private typesetArgument = (variable: any): Language.UserArgumentType => {
    let tmp: Language.UserArgumentType = variable;
    if (this.isForbidden(variable) || this.isReserved(variable)) {
      return variable;
    }
    return tmp;
  };

  error_types = {};
  reserved_words = language_reserved;
  comparison_types = "%s";

  user_set_variables: Language.UserSetVariables = {};

  // @todo this needs to be completed
  get(name: string): Language.UserArgumentType {
    let returnVar = this.user_set_variables[name];
    return returnVar;
  }

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
const blockTokenizer = (
  blockFunction: string
): Array<Language.ComparisonTypes> => {
  let strings = blockFunction.match(language_patterns.block_function_strings);
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
const Vars: UserSetFunctions = new UserSetFunctions();
// --------------------------------------------

const StandardLibrary: Language.StandardLibrary = {
  // --------------------------------------------
  print: (variable: any): void => {
    console.log(variable);
  },
  // --------------------------------------------
  printf: (string: string, variable: any): void => {
    console.log(
      string.replace(language_patterns.printf_template_operator, variable)
    );
  },
  // --------------------------------------------
  get: (variable: string): Language.UserArgumentType => {
    return Vars.get(variable);
  },
  // --------------------------------------------
  set: (
    variable: string,
    value: Language.UserArgumentType
  ): Language.UserArgumentType => {
    Vars.set(variable, value);
    return value;
  },
  // --------------------------------------------
  rem: (string: string): Boolean => {
    return Boolean(string);
  },
  // --------------------------------------------
  nop: () => null,
  // --------------------------------------------
  if: (condition: Boolean, ifTrue: any) => {
    if (condition) {
      () => ifTrue;
    } else {
      return false;
    }
  },
  // --------------------------------------------
  if_else: (condition: Boolean, ifTrue: any, ifFalse: any) => {
    if (condition) {
      () => ifTrue;
    } else {
      () => ifFalse;
    }
  },
  // --------------------------------------------
  loop: (whileLooping: any) => {
    // parse loop body, could use a grammar for this
    let blockTokens = blockTokenizer(whileLooping);

    // process each line in the loop block
    blockTokens.forEach((tok) => {
      return tok;
    });
  },
  // --------------------------------------------
  while: (condition: Boolean, whileTrue: any) => {
    // parse loop body, could use a grammar for this
    let blockTokens = blockTokenizer(whileTrue);

    // process each line in the loop block
    if (condition) {
      blockTokens.forEach((tok) => {
        return tok;
      });
    }
  },
  // --------------------------------------------
  function: (name: string, args: [any], functionBody: any) => {
    let tmp = new Function(...args);
    Vars.set(name, tmp.toString());
    return tmp;
  },
  // --------------------------------------------
  concat: (...items: [string | number]) => {
    return items.join(" ");
  },
  // --------------------------------------------
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
  equal: (
    left: Language.ComparisonTypes,
    right: Language.ComparisonTypes
  ): boolean => {
    return left === right;
  },
  // --------------------------------------------
  not_equal: (
    left: Language.ComparisonTypes,
    right: Language.ComparisonTypes
  ): boolean => {
    return left !== right;
  },
  // --------------------------------------------
  less_than: (
    left: Language.ComparisonTypes,
    right: Language.ComparisonTypes
  ): boolean => {
    return left < right;
  },
  // --------------------------------------------
  less_or_equal: (
    left: Language.ComparisonTypes,
    right: Language.ComparisonTypes
  ): boolean => {
    return left <= right;
  },
  // --------------------------------------------
  greater_than: (
    left: Language.ComparisonTypes,
    right: Language.ComparisonTypes
  ): boolean => {
    return left > right;
  },
  // --------------------------------------------
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

function(anewfunc, print("this is a new function")
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

let tokenArray = tokenize(
  test,//.replace(/\n+/g, " "),
  language_grammar,
  "INVALID"
);
console.log(tokenArray);

// if reserved.includes(token) -> use the token to call the funtion directly
// if type === BAREWORD -> search 'user_set_variables' to check if it has been declared
// if not, throw an error
// 