// CCUS 1.1.0
// parallel tasks (gpu, async-promise-await)
// html, css, latex and regex equivalent string options
// systemverilog

// #region types
type bool = boolean;
type num = number;
type str = string;
type t = any;

type asm = str;

interface token {
  content: str; // raw value
  type: tokenType; // keyword, literal, ...
  index: num; // raw index in the string
  line: num; // how many \n are there before
  column: num; // in the line
}

enum tokenType {
  whitespaces = 0, // \n,  , \t
  comment = 1, // //comment
  keyword = 2, // func, num
  symbol = 3, // +, -, ()
  literal = 4, // 0, true, "hello"
  identifier = 5 // myFunction, myVariable
}
// #endregion

const CCUSheader: str = `
def false (bit)0
def true (bit)1
`;

const CCUSSettingsHeader: str = `

`;

const CCUSFile: str = `
use "ccus"
use "ccussettings"
`;

// TODO serial vs parallel, async
const keywords: str[] = [
  'str', // strig variable
  'num', // numeric variable
  'bint', // big int (needed if num?)
  //'buint', // bit uint (needed if num?)
  'bit', // boolean variable (0 or 1)
  'int8', // integers
  'int16',
  'int32',
  'int64',
  'uint8', // unsigned int
  'uint16',
  'uint32',
  'uint64',
  'float16', // decimal numbers (needed?)
  'float32',
  'float64',
  'float128',
  'float256', // ieee754 octuple precision (needed?)
  'decimal32', // string formated floats (needed?)
  'decimal64',
  'decimal128',
  'decimal256', // (needed?)
  'decimal512', // (needed?)
  'char8', // integer which can get read as a character/string
  'char16',
  'char32',
  'char64', // (needed?)
  'true', // boolean literal (not actually since it is a def)
  'false', // boolean literal (not actually since it is a def)
  'use', // use/include (/inc??) a (header, ccus) file
  'def', // define a placeholder name for a value (preprocess)
  'imp', // import public variables/functions/classes
  'main', // entrypoint function
  'out', // output to user
  'in', // input from user
  'func', // define a function
  'interface', // for let or class
  'let', // create a variable without specifing the type
  'class', // define a class
  'enum', // aliase from string to other type
  'op', // operater overloading
  'iterator', // TODO, for classes
  'ret', // return from function
  'throw', // error occured TODO (execption handling like that??)
  'const', // constant variable/function (like static)
  'static', // needed inside classes because const?
  'ref', // referenz variable (can change value inside other context)
  'if', // if statements
  'else', // previous if statement was not executed so execute this statement (like an if)
  'for', // for/loop loop (var x of vars)/(num i = 0; i < n; i++)/(boolean)/(number??) statement
  'switch', // switch between multiple choices (like an if)
  'break', // break inside a for loop/switch
  'pub', // function/class/variable is accessible from other files/classes
  'priv', // function/class/variable is not accessible from other files/classes/contextes
  'prot', // function/class/variable is only accessible by derived classes
  'of', // for for loops
  'typeof', // get the type of a variable at runtime
  'new' // create a new object
];

const symbols: str[] = [
  '(', // open bracket (parentheses, math, boolean, arguments)
  ')', // closing bracket (parentheses, math, boolean, arguments)
  '{', // open curly bracket (object or body)
  '}', // closing curly bracket (object or body)
  '[', // open square bracket (array)
  ']', // closing square bracket (array)
  '.', // point, class/exports
  ',', // seperator (array, object, arguments in function)
  ';', // end of a statement
  ':', // for each/ key value pair seperator TODO
  '?', // optional argument in function/ tenray operator
  '+', // add, also strings
  '-', // subtrackt
  '*', // multiply
  '/', // divide
  '**', // exponent
  '__', // root
  '%', // mod
  '~', // not (bit manipulation)
  '&', // and (bit manipulation)
  '|', // or (bit manipulation)
  '^', // xor (bit manipulation)
  '<<', // left shift operator (bit manipulation)
  '>>', // right shift operator (bit manipulation)
  '!', // not (boolean expression)
  '&&', // and (boolean expression)
  '||', // or (boolean expression)
  '=', // variable assigment
  '+=', // var X= val; => var = var X val;
  '-=', // ""
  '*=', // ""
  '/=', // ""
  '**=', // ""
  '__=', // ""
  '%=', // ""
  '~=', // ""
  '&=', // ""
  '|=', // ""
  '^=', // ""
  '<<=', // ""
  '>>=', // ""
  '!=', // ""
  '&&=', // ""
  '||=', // ""
  '++', // increase by 1 (increment), postfix and prefix
  '--', // decrease by 1 (decrement)
  '==', // is equal
  '!=', // is not equal
  '<', // is smaller than
  '>', // is bigger than
  '<=', // is smaller or equal than
  '>=', // is bigger or equal than
  '=>', // short function
  '...' // unpack operator
  //'_', // number seperator
  //'\\', // escape character in string
  //'//', // comment
  //'/*', // multiline comment start
  //'/**', // multiline comment with descriptors start
  //'*/', // multiline comment end
  //'"', // string identifier
  //'(s)', // toString() TODO
  //' ', // whitespace 0 TODO
  //'\n', // whitespace 1 TODO
  //'\t', // whitesspace 2 TODO
  //'[]', // array operator TODO
  //'PI', // 3.1415926535897931
  //'TAU', // 6.2831853071795862
  //'E' // 2.71828
];

class CCUS {
  constructor() {}

  /**
   *
   */
  public static ASMinterpreter(asmInstructions: str[]): void {}

  /**
   *
   */
  public static CCUStoASM(sourceCode: str): {
    originalSourceCode: str;
    tokensOfSourceCode: token[];
    preprocessedSourceCode: token[];
    codeLogicTree: t;
    asmInstructions: str[];
  } {
    sourceCode = CCUSFile + sourceCode;
    const originalSourceCode: str = sourceCode;
    const tokens: token[] = this.getTokens(originalSourceCode);
    // check global folder for headers, then project folder and then local files
    const preprocessedCode: token[] = this.preprocess(tokens);
    const logicTree: any = this.logicAnalyser(preprocessedCode);
    const optimisedTree: any = this.optimiseTree(logicTree);

    return {
      originalSourceCode: originalSourceCode,
      tokensOfSourceCode: tokens,
      preprocessedSourceCode: preprocessedCode,
      codeLogicTree: optimisedTree,
      asmInstructions: []
    };
  }

  public static getTokens(sourceCode: str): token[] {
    // TODO: comments, keywords, symbols and identifiers inside string literals

    // comments (char by char)
    // literals (char by char/regexp)

    // symbols (regexp)

    // identifier and then filter for keywords (regexp)

    // check for surviving characters beside whitespaces

    let code: str = sourceCode;
    let lastUsedType: tokenType; // TODO, much better way
    // TODO escaped comments, escaped escaped characters

    // escapes every character inside a string for new RegExp(string)_
    const escapeStringForRegex: RegExp = /[-[/\]{}()*+?.,\\^$|#\s]/g;

    const comments: token[] = [];
    const _keywords: token[] = [];
    const _symbols: token[] = [];
    const literals: token[] = [];
    let identifiers: token[] = [];

    // old /(?:\/\/.*)|(?:(?:\/\*)(?:[\s\S]*?)(?:\*\/))/g
    // new /(?:\/\/(?:[^/\n]|\/[^/\n]|\/$)*)|(?:\/\*.*\*\/)/gm
    //const commentRegex: RegExp =
    //  /(?:\/\/(?:[^/\n]|\/[^/\n]|\/$)*)|(?:\/\*.*\*\/)/gm;
    const keywordsRegex: RegExp = new RegExp(
      keywords.reduce((prev, cur) => prev + '|' + cur),
      'g'
    );
    const symbolsRegex: RegExp = new RegExp(
      symbols
        .sort((a, b) => (a.length < b.length ? 1 : -1))
        .map((e) => e.replace(escapeStringForRegex, '\\$&'))
        .reduce((prev, cur) => prev + '|' + cur),
      'g'
    );
    //const literalsRegex: RegExp =
    //   /(?:true|false)|(?:[+-]?(?:0[dDbBoO][+-]?)?[0-9]+(?:\.[0-9]*)?(?:[eEpP][+-]?[0-9]+)?)|(?:"(?:\\"|[^"])*")/g;
    const identifierRegex: RegExp = /[_a-zA-Z][a-zA-Z0-9]*/g;

    function replacer(match: str, offset: num, string: str): str {
      const token: token = {
        content: match,
        type: lastUsedType,
        index: offset,
        line:
          string
            .slice(0, offset)
            .split('')
            .filter((e) => e === '\n').length + 1, // linesBeforeMatch.length
        column: offset - 1 - string.slice(0, offset).lastIndexOf('\n') // (offset) - lastLine (TODO what if no \n => -1)
      };

      // index of the start of the line
      let indexOfStart: num = string.slice(0, offset).lastIndexOf('\n');
      if (indexOfStart === -1) indexOfStart = 0;
      // index of the end of the line
      const indexOfEnd: num =
        string
          .slice(indexOfStart + 1)
          .split('')
          .indexOf('\n') +
        indexOfStart +
        2;
      // the current line of code
      const lineOfCode: str = string.slice(indexOfStart, indexOfEnd);

      switch (lastUsedType) {
        case tokenType.comment:
          return '';
          // TODO, comment in string then comment => only one comment was sawn + it is the first one
          // if the comment is inside a string
          // TODO, get all the strings and check if the indexes of beginning and end are in between the offset
          // if (startIndex < offset && endIndex > offset
          //THIS
          let matchIndexInLineOfCode: num = token.column;
          //let matchIndexOfEndInLineOfCode: num = token.column + match.length;
          // get indexes of none escaped " characters
          // TODO what if " " // "
          let indexes: num[] = [];
          let isEscaped: bool = false;
          for (let i = 0; i < lineOfCode.length; ++i) {
            const char: str = lineOfCode[i];

            // next character will be escaped if this one isnt escaped
            if (char === '\\' && isEscaped === false) isEscaped = true;
            else if (char === '"' && isEscaped !== true) indexes.push(i);
            else if (isEscaped === true) isEscaped = false;

            // TODO check for previous comments and if the " was inside them
            // not possible as multiline comments are a thing
          }
          console.log('indexes: ', indexes);
          // lineOfCode
          //   .split('')
          //   .forEach((value, index) =>
          //     value === '"' ? indexes.push(index) : 0
          //   );
          //console.log(match + '\n', indexes, matchIndexInLineOfCode);
          let startIndexesOfStringLiterals: num[] = indexes.filter(
            (v, i) => i % 2 === 0
          );
          let endIndexesOfStringLiterals: num[] = indexes.filter(
            (v, i) => i % 2 === 1
          );
          if (
            startIndexesOfStringLiterals.length !==
            endIndexesOfStringLiterals.length
          )
            console.error(
              '[LEXER]: ERROR\nDifferent amounts of opend string literals than closed literals: ' +
                startIndexesOfStringLiterals.length +
                ' opend, ' +
                endIndexesOfStringLiterals.length +
                ' closed\n'
            );

          //console.log(indexes, match);

          for (let i = 0; i < startIndexesOfStringLiterals.length; ++i) {
            if (
              matchIndexInLineOfCode >= startIndexesOfStringLiterals[i] &&
              matchIndexInLineOfCode <= endIndexesOfStringLiterals[i]
            )
              return match; // the comment is inside the string
          }
          // if (
          //   lineOfCode.match(
          //     new RegExp(
          //       `".*${match}.*"`.replace(escapeStringForRegex, '\\$&'),
          //       'g'
          //     )
          //   )
          // )
          //   return match;

          comments.push(token);
          break;
        case tokenType.keyword:
          // if before or after is an alphanumeric character it is not a keyword
          if (
            (offset !== 0 ? string[offset - 1].match(/[_a-zA-Z]/) : false) ||
            string[offset + match.length].match(/[a-zA-Z]/)
          )
            return match;

          // if it is inside a comment it is not a keyword
          // TODO, get all the strings and check if the indexes of beginning and end are in between the offset
          if (
            lineOfCode.match(
              new RegExp(
                `".*${match.replace(escapeStringForRegex, '\\$&')}.*"`,
                'g'
              )
            )
          )
            return match;

          _keywords.push(token);
          break;
        case tokenType.symbol:
          // if it is inside a comment it is not a symbol
          // TODO, get all the strings and check if the indexes of beginning and end are in between the offset
          if (
            lineOfCode.match(
              new RegExp(
                `".*${match.replace(escapeStringForRegex, '\\$&')}.*"`,
                'g'
              )
            )
          )
            return match;

          // TODO check if e.g. - or + is inside a number literal

          _symbols.push(token);
          break;
        case tokenType.literal:
          return '';
          // TODO, what if number literal inside string literal
          literals.push(token);
          break;
        case tokenType.identifier:
          // if it is inside a comment it is not an identifier
          // TODO, get all the strings and check if the indexes of beginning and end are in between the offset
          if (
            lineOfCode.match(
              new RegExp(
                `".*${match.replace(escapeStringForRegex, '\\$&')}.*"`,
                'g'
              )
            )
          )
            return match;

          // if it is 1 to 1 a keyword it is not an identifier
          if (keywords.includes(match)) return match;

          identifiers.push(token);
          break;
      }

      return ' '.repeat(match.length);
    }

    // get all the comments and replace them with whitespaces (space)
    // for correct indexes later
    //lastUsedType = tokenType.comment;
    //code = code.replace(commentRegex, replacer);

    // TODO get comments and replace them with whitespaces
    // TODO get string literals, get number literals
    let inStr: bool = false;
    let inComment: bool = false;
    let lastCharWasEscape: bool = false;
    let lastIndex: num = 0;
    let curContent: str = '';
    for (let i = 0; i < code.length; ++i) {
      const char: str = code[i];

      // code for string literal
      if (char === '"' && inStr === false && inComment === false) {
        // start a new string literal
        inStr = true;
        curContent += char;
        lastIndex = i;
        continue;
      } else if (
        char === '\\' &&
        inStr === true &&
        inComment === false &&
        lastCharWasEscape === false
      ) {
        // save escape characters
        lastCharWasEscape = true;
        curContent += char;
        continue;
      } else if (
        char === '"' &&
        inStr === true &&
        inComment === false &&
        lastCharWasEscape === false
      ) {
        // check if string literal is at it's end
        curContent += char;
        literals.push({
          content: curContent,
          type: tokenType.literal,
          index: lastIndex,
          line:
            code
              .slice(0, lastIndex)
              .split('')
              .filter((e) => e === '\n').length + 1, // linesBeforeMatch.length
          column: lastIndex - 1 - code.slice(0, lastIndex).lastIndexOf('\n') // (offset) - lastLine (TODO what if no \n => -1)
        });
        curContent = '';
        inStr = false;

        continue;
      } else if (lastCharWasEscape === true) {
        lastCharWasEscape = false;
        if (inStr === true) curContent += char;
        continue;
      }

      // code for single line comment
      if (char === '/' && inStr === false) {
      }
    }

    // get all the literals and replace them with whitespaces
    // TODO a lot of things, numbers: 0x support, strings are broken (identifiers, keywords, ...)
    //lastUsedType = tokenType.literal;
    //code = code.replace(literalsRegex, replacer);

    // get all the identifiers and replace them with whitespaces
    lastUsedType = tokenType.identifier;
    code = code.replace(identifierRegex, replacer);

    // get all the symbols and replace them with whitespaces
    lastUsedType = tokenType.symbol;
    code = code.replace(symbolsRegex, replacer);

    // get all the keywords and replace them with whitespaces
    // RegExp: num|func|... and escape every character if needed
    //lastUsedType = tokenType.keyword;
    //code = code.replace(keywordsRegex, replacer);

    // TODO go through all the identifiers and check for keywords

    // delete all the whitespace characters
    //code = code.replace(/\n+/g, '').replace(/\t+/g, '').replace(/ +/g, '');

    identifiers = identifiers.filter((e) => {
      if (e.content.match(keywordsRegex) !== null) {
        _keywords.push(e);
        return false;
      } else return true;
    });

    // check if there are remaining characters
    if (code.match(/(?:\n|\t| )*/g) !== null)
      console.error('[LEXER]: Unresolved characters in source code: ', code);

    return [
      ...comments,
      ..._keywords,
      ..._symbols,
      ...literals,
      ...identifiers
    ].sort((a, b) => (a.index <= b.index ? -1 : 1));
  }

  private static preprocess(tokens: token[]): token[] {
    // remove whitespaces and comments
    tokens = tokens.filter(
      (t) => t.type !== tokenType.whitespaces && t.type !== tokenType.comment
    );
    // use and def keywords
    // check if they are used properly
    return tokens;
  }

  private static logicAnalyser(tokens: token[]): t {}

  private static optimiseTree(logicTree: t): t {}
}

const sourceCode1: str = `
"\\"// not a comment"
"\\"" // " this is a comment
"\\"" // "
/* " */ // " comment
"//not a comment bug"; // f(x) = 2x
"\\"" // " this is a comment
func f(num x) {
  "wrong //comment func ; correct comment ";
  ret 2 *x++; // g(i) = 3i
  ret x++ + (++y[]++)*x;}//
//`;

const sourceCode2: str = `//
  // valid CCS file lol

  def aDef "myVal" // every "aDef" should be replaced with "myVal"
  use "file1" // insert the "file1" file at this position
  int32 x = 5;
  def PI 314
//cmt
 /* / * kfldfl
 *
 *
 f
 / ***/
"wrong comment"
  // just some empty line
     PI
  "other/*f*/Def" // probably wrongly parsed
  otherDef
  // just some spaces to potentially throw of the preCompiler
  func Main () {// just a normal func which has no return type btw
    // this is a comment and an invalid def is here def aDeff 54 aDef
    def otherDef 4 // another def in the middle of the file, which is still a global thing
    if (MyFunc(5) == 5) { // if statement with function and == use
      out("fire 1 dash 1"); // output a string
    } else { // else statement
        out  (  "fire 1 dash 2"   )    ;
    } use "file 2" // use statment in the middle of the line and of the file
  aDef

    str aStr = " Hello world ";

    num myNum = -5.3E+5;

  // same as the last if just where the else should get called
    if (MyFunc(3) == 7) {
      Log("fire 2 dash 1");
    } else {otherDef
      Log("fire 2 dash 2");
    }
  otherDef

  // just a normal for loop
    for (num x = 0; x < 5; x++) {
     otherDef Log(x);
    }

     num   x    =5    ;
    while (x < 10) {
      out(x);
      x = x + 1;
    }

    out(h);
  }

  func num MyFunc (num i) {
    const num x = 5;
    out(x);

    return i;

    func NoArgsNoCode () {

    }
  }

  // valid comment? // still?
  // this should test if complex spacing is working correctly
  // especially the argument part in the middle
       func     objs    StrangeFormattedfunc     (



          num

  // also a valid comment lol

          arg2  , str lOl // valid comment


           )


    {


                }

  // just declaring a operator as normal
  op num ("++", int x,) {

  }

  op num ("--", , int x) { }

  // benchmark for strange formatting lol
  func
  strs
  haha
  ()
  {}

  otherDeffunc obj ANewFuncWhichShouldNotWork(){}

  / / 0
  /  / 1
  /  / invalid comment because spaces lmao 2
  /
  / 3
  // all of them are not comments 4
  //`;

//console.log(CCUS.CCUStoASM(sourceCode2).preprocessedSourceCode);
console.log(CCUS.getTokens(sourceCode1));
