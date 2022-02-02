// CCUS 1.0.0

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

const keywords: string[] = [
  'use', // use/include (/inc??) a (header) file
  'def', // define a placeholder name for a value (preprocess)
  'imp', // import public variables
  'main', // entrypoint function
  'out', // output to user
  'in', // input from user
  'true', // boolean value
  'false', // boolean value// types
  'op', // operater overloading
  'func', // define a function
  'class', // define a class
  'ret', // return from function
  'throw', // error occured TODO (execption handling like that??)
  'const', // constant variable/function (like static)
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

// ?:
const symbols: string[] = [
  '(', // open bracket (parentheses, math, boolean, arguments)
  ')', // closing bracket (parentheses, math, boolean, arguments)
  '{', // open curly bracket (object or body)
  '}', // closing curly bracket (object or body)
  '[', // open square bracket (array)
  ']', // closing square bracket (array)
  '.', // point, class/exports
  ',', // seperator (array, object, arguments in function)
  ';', // end of a statement
  '//', // comment
  '/*', // multiline comment start
  '/**', // multiline comment with descriptors start
  '*/', // multiline comment end
  '=', // variable assigment
  '?', // optional argument in function
  '"', // string identifier
  '\\', // escape character in string
  '+', // add, also strings
  '-', // subtrackt
  '*', // multiply
  '/', // divide
  '**', // exponent
  '__', // root
  '%', // mod
  '+=', // add val to var and save in var
  '-=', // ""
  '*=', // ""
  '/=', // ""
  '**=', // ""
  '__=', // ""
  '%=', // ""
  '<<=', // ""
  '>>=', // ""
  '&=', // ""
  '|=', // ""
  '^=', // ""
  '&&=', // ""
  '||=', // ""
  '++', // increase by 1
  '--', // decrease by 1
  '==', // is equal
  '!=', // is not equal
  '<', // is smaller than
  '>', // is bigger than
  '<=', // is smaller or equal than
  '>=', // is bigger or equal than
  '!', // not (boolean expression)
  '&&', // and (boolean expression)
  '||', // or (boolean expression)
  '~', // not (bit manipulation)
  '&', // and (bit manipulation)
  '|', // or (bit manipulation)
  '^', // xor (bit manipulation)
  '(s)', // toString()
  ':', // for each/ key value pair seperator TODO
  '_', // number seperator
  ' ', // whitespace 0
  '\n', // whitespace 1
  '\t', // whitesspace 2
  '[]', // array operator
  '<<', // left shift operator
  '>>', // right shift operator
  '=>' // short function
  //'PI', // 3.1415926535897931
  //'TAU', // 6.2831853071795862
  //'E' // 2.71828
];

class CCUS {
  constructor() {}

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
    const originalSourceCode: string = sourceCode;
    const tokens: token[] = this.getTokens(originalSourceCode);
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

  /**
   *
   */
  public static ASMinterpreter(asmInstructions: str[]): void {}

  public static getTokens(sourceCode: str): token[] {
    let code: str = sourceCode;
    let lastUsedType: tokenType; // TODO, much better way

    const comments: token[] = [];
    const literals: token[] = [];
    const _keywords: token[] = [];
    const identifiers: token[] = [];

    function replacer(match: str, offset: num, string: str) {
      const token: token = {
        content: match,
        type: lastUsedType,
        index: offset,
        line:
          string
            .slice(0, offset)
            .split('')
            .filter((e) => e === '\n').length + 1, // linesBeforeMatch.length
        column: offset - 1 - string.slice(0, offset).lastIndexOf('\n') // (offset) - lastLine
      };

      switch (lastUsedType) {
        case tokenType.comment:
          comments.push(token);
          break;
        case tokenType.literal:
          literals.push(token);
          break;
        case tokenType.keyword:
          _keywords.push(token);
          break;
        case tokenType.identifier:
          identifiers.push(token);
          break;
      }

      return ' '.repeat(match.length);
    }

    // TODO: comments inside string literals

    // get all the comments and replace them with whitespaces (space)
    // for correct indexes later
    const commentRegex: RegExp = /(?:\/\/.*)|(?:(?:\/\*)(?:[\s\S]*?)(?:\*\/))/g;
    lastUsedType = tokenType.comment;
    code = code.replace(commentRegex, replacer);

    // get all the literals and replace them with whitespaces
    const literalsRegex: RegExp =
      /(?:true|false)|(?:"(?:\\"|[^"])*")|(?:[+-]?(?:0[dDbBoO][+-]?)?[0-9]+(?:\.[0-9]*)?(?:[eEpP][+-]?[0-9]+)?)/g;
    lastUsedType = tokenType.literal;
    code = code.replace(literalsRegex, replacer);

    // get all the keywords and replace them with whitespaces
    const keywordsRegex: RegExp = new RegExp(
      keywords.reduce((prev, cur) => prev + '|' + cur),
      'g'
    );
    lastUsedType = tokenType.keyword;
    code = code.replace(keywordsRegex, replacer);

    // get all the identifiers and replace them with whitespaces
    const identifierRegex: RegExp = /[_a-zA-Z][a-zA-Z]*/g;
    lastUsedType = tokenType.identifier;
    code = code.replace(identifierRegex, replacer);

    // get all the symbols and replace them with whitespaces

    // replace all the whitespaces with ""
    code = code.replace('\n', '').replace('\t', '').replace(/ +/g, '');

    // check if there are remaining characters
    if (code.length !== 0) {
      console.error('[LEXER]: Unresolved characters in source code: ', code);
    }

    return [...comments, ...literals, ..._keywords, ...identifiers].sort(
      (a, b) => (a.index <= b.index ? -1 : 1)
    );
  }

  private static preprocess(tokens: token[]): token[] {
    return [];
  }

  private static logicAnalyser(tokens: token[]): t {}

  private static optimiseTree(logicTree: t): t {}
}

const sourceCode: str = `
// f(x) = 2x
func f(num x) {
  ret 2 * x;
}
`;

//const resolvedCode = CCUS.CCUStoASM(sourceCode);
//console.log(resolvedCode);
//CCUS.ASMinterpreter(resolvedCode.asmInstructions);

const testCode: str = `//
  // valid CCS file lol
  def aDef "myVal" // every "aDef" should be replaced with "myVal"
  use "file1" // insert the "file1" file at this position
  def PI 314
//cmt
 /* / * kfldfl
 *
 *
 f
 / ***/
"wrong comment"
  // just some empty line
     PI number
  other/*f*/Def
  // just some spaces to potentially throw of the preCompiler
  func Main () {// just a normal func which has no return type btw
    // this is a comment and an invalid def is here def aDeff 54
    def otherDef 4 // another def in the middle of the file, which is still a global thing
    if (MyFunc(5) == 5) { // if statement with function and == use
      out("fire 1 dash 1"); // output a string
    } else { // else statement
        out  (  "fire 1 dash 2"   )    ;
    } use "file 2" // use statment in the middle of the file
  aDef

    str aStr = " Hello\\\\" world ";

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

console.log(CCUS.getTokens(testCode));
console.log(new RegExp(keywords.reduce((prev, cur) => prev + '|' + cur)) + 'g');
