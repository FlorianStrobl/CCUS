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
    const originalSourceCode: str = sourceCode; // save the original code
    sourceCode = CCUSFile + sourceCode; // add the default header

    // lexer/tokenizer
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
    // comments (char by char)
    // literals (char by char/regexp)

    // symbols (regexp)

    // identifier and then filter for keywords (regexp)

    // check for surviving characters beside whitespaces

    let code: str = sourceCode;
    let lastUsedType:
      | tokenType.identifier
      | tokenType.literal
      | tokenType.symbol; // TODO, much better way
    // TODO escaped comments, escaped escaped characters

    // escapes every character inside a string for new RegExp(string)_
    const escapeStringForRegex: RegExp = /[-[/\]{}()*+?.,\\^$|#\s]/g;

    let comments: token[] = [];
    const _keywords: token[] = [];
    const _symbols: token[] = [];
    let literals: token[] = [];
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
    const identifierRegex: RegExp = /[_a-zA-Z][a-zA-Z0-9]*/g;
    // TODO .5, 0x
    const literalRegex: RegExp =
      /(?:(?:0[bBdDoO])?[0-9]+(?:.[0-9]+)?(?:[eEpP][+-]?[0-9]+)?)/g;

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
        case tokenType.symbol:
          _symbols.push(token);
          break;
        case tokenType.literal:
          // only numbers
          literals.push(token);
          break;
        case tokenType.identifier:
          identifiers.push(token);
          break;
      }

      return ' '.repeat(match.length);
    }

    // TODO now remove comments and string literals
    // TODO get comments and replace them with whitespaces
    // TODO get string literals, get number literals
    function commentsStrings(c: str): {
      com: token[];
      strs: token[];
      code: str;
    } {
      let com: token[] = [];
      let strs: token[] = [];

      let curContent: str = ''; // char array
      let lastIndex: num = 0; // raw index of the current saved content

      let inStr: bool = false; // char is inside a string
      let inComment: bool = false; // char is inside a comment

      let lastCharWasEscape: bool = false; // use for escaped " in strings

      let commentType: 0 | 'single' | 'multi' = 0; // 0 is none
      let lastCharWasSlash: bool = false; // use for start comment
      let lastCharWasStar: bool = false; // use for finish multiline comment

      // TODO escape multiline comment
      for (let i = 0; i < c.length; ++i) {
        const char: str = c[i];

        // #region code for string literal
        if (char === '"' && inStr === false && inComment === false) {
          // start a new string literal
          inStr = true;
          curContent = char;
          lastIndex = i;
          continue;
        } else if (
          char === '\\' &&
          inStr === true &&
          inComment === false &&
          lastCharWasEscape === false
        ) {
          // escape the next character
          lastCharWasEscape = true;
          curContent += char;
          continue;
        } else if (
          char === '"' &&
          inStr === true &&
          inComment === false &&
          lastCharWasEscape === false
        ) {
          // finished current string
          curContent += char;
          strs.push({
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
          lastIndex = 0;
          inStr = false;
          lastCharWasEscape = false; // reset if needed

          continue;
        } else if (inStr === true) {
          // usual string
          curContent += char;

          // stop escaping the next character
          if (lastCharWasEscape === true) lastCharWasEscape = false;
          continue;
        }
        // #endregion

        // #region code for comments
        if (
          char === '/' &&
          inStr === false &&
          inComment === false &&
          lastCharWasSlash === false
        ) {
          // check if it could be the star of a comment
          lastCharWasSlash = true;
          curContent = char; // save values for the case (!) it is a comment
          lastIndex = i;
          continue;
        }

        if (
          char === '/' &&
          inStr === false &&
          inComment === false &&
          lastCharWasSlash === true
        ) {
          // single line comment was started
          lastCharWasSlash = false; // no longer needed
          inComment = true;
          curContent += char;
          commentType = 'single';
          continue;
        } else if (
          char === '*' &&
          inStr === false &&
          inComment === false &&
          lastCharWasSlash === true
        ) {
          // multi line comment was started
          lastCharWasSlash = false; // no longer needed
          inComment = true;
          curContent += char;
          commentType = 'multi';
          continue;
        } else if (
          inStr === false &&
          inComment === false &&
          lastCharWasSlash === true
        )
          lastCharWasSlash = false; // false alarm

        if (
          char === '\n' &&
          inStr === false &&
          inComment === true &&
          commentType === 'single'
        ) {
          // curContent += char; do not save the last \n
          // save
          com.push({
            content: curContent,
            type: tokenType.comment,
            index: lastIndex,
            line:
              c
                .slice(0, lastIndex)
                .split('')
                .filter((e) => e === '\n').length + 1, // linesBeforeMatch.length
            column: lastIndex - 1 - c.slice(0, lastIndex).lastIndexOf('\n') // (offset) - lastLine (TODO what if no \n => -1)
          });
          inComment = false;
          commentType = 0; // reset all values
          curContent = '';
          lastIndex = 0;
          continue;
        } else if (
          char === '*' &&
          inStr === false &&
          inComment === true &&
          commentType === 'multi'
        ) {
          lastCharWasStar = true; // prepare end
          curContent += char; // still save
          continue;
        } else if (
          char === '/' &&
          inStr === false &&
          inComment === true &&
          commentType === 'multi' &&
          lastCharWasStar === true
        ) {
          curContent += char;
          lastCharWasStar = false;
          // save
          com.push({
            content: curContent,
            type: tokenType.comment,
            index: lastIndex,
            line:
              c
                .slice(0, lastIndex)
                .split('')
                .filter((e) => e === '\n').length + 1, // linesBeforeMatch.length
            column: lastIndex - 1 - c.slice(0, lastIndex).lastIndexOf('\n') // (offset) - lastLine (TODO what if no \n => -1)
          });
          inComment = false; // reset values
          curContent = '';
          lastIndex = 0;
          commentType = 0;
          continue;
        } else if (inStr === false && inComment === true) {
          curContent += char;
          if (lastCharWasStar === true) lastCharWasStar = false; // reset wrong alarm
          continue;
        }

        // TODO test: comment start detected wrongly
        if (
          inStr === false &&
          inComment === false &&
          lastCharWasSlash === true
        ) {
          lastCharWasSlash = false;
          curContent = ''; // reset values because wrong start of comment
          lastIndex = 0;
          continue;
        }
        // #endregion
      }

      // last character could have been skipped due to source code end
      if (inStr === true) {
        // commit and ignore the rest
        strs.push({
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
      } else if (inComment === true) {
        // commit and ignore the rest
        com.push({
          content: curContent,
          type: tokenType.comment,
          index: lastIndex,
          line:
            code
              .slice(0, lastIndex)
              .split('')
              .filter((e) => e === '\n').length + 1, // linesBeforeMatch.length
          column: lastIndex - 1 - code.slice(0, lastIndex).lastIndexOf('\n') // (offset) - lastLine (TODO what if no \n => -1)
        });
      }

      // replace comments and strings in src code with empty spaces
      for (const e of [...com, ...strs])
        c =
          c.substring(0, e.index) +
          '\n'.repeat(e.content.split('').filter((c) => c === '\n').length) + // number of lines
          ' '.repeat(e.content.split('').filter((c) => c !== '\n').length) + // number of spaces
          c.substring(e.index + e.content.length, c.length);

      return { com: com, strs: strs, code: c };
    }

    // get all the comments and strings
    // replace them with whitespaces (space) for correct indexes later
    const vals: {
      com: token[]; // comments
      strs: token[]; // strings
      code: str; // code with replaced strings and comments
    } = commentsStrings(code);
    comments = vals.com;
    literals = vals.strs;
    code = vals.code;

    // get all the literals and replace them with whitespaces
    lastUsedType = tokenType.literal;
    code = code.replace(literalRegex, replacer);

    // get all the identifiers and replace them with whitespaces
    lastUsedType = tokenType.identifier;
    code = code.replace(identifierRegex, replacer);
    // get all the keywords and replace them with whitespaces
    identifiers = identifiers.filter((e) => {
      if (e.content.match(keywordsRegex) !== null) {
        _keywords.push(e);
        return false;
      } else return true;
    });

    // get all the symbols and replace them with whitespaces
    lastUsedType = tokenType.symbol;
    code = code.replace(symbolsRegex, replacer);

    // check if there are remaining characters
    if (code.match(/[\n\t ]*/g).join('') !== code) {
      console.error(
        '[LEXER]: Unresolved characters in source code: ',
        code.match(/[^\n\t]*/g).filter((s) => s.replace(/ /g, '').length !== 0)
      );
      // TODO get exact lines and columns for the unidentified characters
    }

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

const sourceCode0: str = `
// f(x) = 2x
func f(num x) {
  ret 2 * x;
}
`;

// TODO now, one \n too much for single line comments
const sourceCode1: str = `
"test"j;
func f(num x) {
  "wrong //comment func ; correct comment ";
  ret 2 / x++; // g(i) = 3i
  5.6;
  0b1001.101;
  .5;
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
console.time();
console.log(CCUS.getTokens(sourceCode0));
console.timeEnd();
