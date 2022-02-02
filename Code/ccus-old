// #region types, vars and funcs
type code = string;
type alphanumeric = string;
type identifier = alphanumeric;
type token = string;

interface IVariable {
  name: identifier;
  type: Type;
  context: identifier;
  value?: string;
  varCurrentValue?: string;
  public?: boolean;
}

interface IFunction {
  name: identifier;
  body: code;
  args: IFunctionArgument[];
  retType?: Type;
}

interface IFunctionArgument {
  name: identifier;
  type: Type;
}

interface IContext {
  context: alphanumeric;
  vars: IVariable[];
  funcs: IFunction[];
}

interface IFunctionContext extends IContext {
  args?: IVariable[];
}

interface internLiteralsHandling {
  literalPlaceholder: string;
  literalValue: string;
}

const getAlphanumericNames: RegExp = /\b[A-Za-z][A-Za-z0-9]*\b/g;
const commentRegex: RegExp = /(?:\/\/.*)|(?:(\/\*)(?:[\s\S]*?)(?:\*\/))/g;
const isStringRegex: RegExp = /"(?:\\"|[^"])*"/g;
const isBoolRegex: RegExp = /true|false/g;
const isNumberRegex: RegExp =
  /(?:[+-]?(?:0[dDbBoOxX][+-]?)?[0-9]+(?:\.[0-9]*)?([eEpP][+-]?[0-9]+)?)|(?:[+-]?(?:0[dDbBoOxX][+-]?)?[0-9]*(?:\.[0-9]+)([eEpP][+-]?[0-9]+)?)/g;
const isLiteralRegex: RegExp =
  /`true|false|(?:"(?:\\"|[^"])*")|`(?:[+-]?(?:0[dDbBoOxX][+-]?)?[0-9]+(?:\.[0-9]*)?([eEpP][+-]?[0-9]+)?)|(?:[+-]?(?:0[dDbBoOxX][+-]?)?[0-9]*(?:\.[0-9]+)([eEpP][+-]?[0-9]+)?)/g;

const literalPlaceholder: RegExp = /\$\d+\$/g;
const isUseStatement: RegExp =
  /\buse ((?:"[a-zA-Z][a-zA-Z0-9]*")|(?:\$[0-9]+\$))/g;
const isDefStatement: RegExp = /\bdef [a-zA-Z][a-zA-Z0-9]* [\s\S]*?\n/g;

// dangerous, cause invalid characters are possible in the word string
const isWord: (word: string) => RegExp = (word: string) =>
  new RegExp(`\b${word}\b`, 'g');
const Log: (log: any) => void = (log: any) => console.log(log);

function isAlphanumeric(str: string): boolean {
  return !!str.match(/^[A-Za-z0-9]+$/g); // one or more chars AZaz09
}

function isValidIdentifierName(str: string): boolean {
  return (
    str !== '' &&
    str !== ' ' &&
    isAlphanumeric(str) &&
    isLetter(str.split('')[0]) // first letter has to be a letter
  );
}

function isLetter(char: string): boolean {
  return !!char.match(/[a-zA-Z]/);
}

enum Type {
  'void' = 'void',
  'var' = 'var',
  'vars' = 'vars',
  'bool' = 'bool',
  'bools' = 'bools',
  'num' = 'num',
  'nums' = 'nums',
  'str' = 'str',
  'strs' = 'strs',
  'obj' = 'obj',
  'objs' = 'objs'
}
// #endregion

enum tokenType {
  none, // invalid char
  literal, // a boolean, number or string
  identifier, // var and func names
  keyword, // reserved word like func
  symbol // operator and separator like + and .
}

function swapLiterals(code: code): {
  code: code;
  literals: internLiteralsHandling[];
} {
  // remove all strings before accessing code
  const literalsHandler: {
    code: string;
    literals: internLiteralsHandling[];
  } = extractLiterals(code, isLiteralRegex, '$');
  code = literalsHandler.code; // replace the file with the placeholder file
  return { code: code, literals: literalsHandler.literals }; // the placeholders

  // e.g. `code "sub" code` => `code $0$ code`
  function extractLiterals(
    code: code,
    replaceLiteralsForm: RegExp,
    replaceSymbol: string
  ): {
    code: code;
    literals: internLiteralsHandling[];
  } {
    let id: number = -1;
    let literals: internLiteralsHandling[] = [];

    const newCode: string = code.replace(
      replaceLiteralsForm, // everything in the specified format
      (
        placeholder // for every literal inside the code
      ) => {
        id++;
        literals.push({
          literalValue: placeholder, // the value of the to replace literal
          literalPlaceholder: '$' + id + '$' // the replace value for the literal
        });
        return '$' + id + '$';
      }
    );

    return { code: newCode, literals: literals };

    // #region manual version
    // the literals data
    let literals_: internLiteralsHandling[] = [];
    // keep track of the current placeholder number
    let placeholderCount: number = 0;

    for (const literal of code.match(replaceLiteralsForm) ?? []) {
      // check if already was replaced once
      const index: number = literals_.findIndex(
        (s) => s.literalValue === literal
      );

      if (index === -1) {
        // new literal

        const placeholderValue: string =
          replaceSymbol + placeholderCount + replaceSymbol;

        // add the literal to the array
        literals_.push({
          literalValue: literal, // the value of the to replace literal
          literalPlaceholder: placeholderValue // the replace value for the literal
        });

        // replace the literal with the placeholder (not all occurences!)
        code = code.replace(literal, placeholderValue);
        // inc placeholder count
        placeholderCount++;
      }
      // wass already replaced at least once, reuse the placeholder
      else code = code.replace(literal, literals_[index].literalPlaceholder);
    }

    return { code: code, literals: literals_ };
    // #endregion
  }
}

const keywords: string[] = [
  ...Object.values(Type), // types
  'in', // input from user
  'out', // output to user
  'main', // entrypoint function
  'def', // define a placeholder name for a value (precompile)
  'use', // use/include (inc) a file
  'class', // create a class
  'op', // create an operater
  'func', // create a function
  'ret', // return from function
  'throw', // function did error
  'const', // constant variable/function (like static)
  'ref', // referenz variable (can change value inside other context)
  'if', // if boolean statements
  'else', // previous if statement was not executed so execute this statement (like an if)
  'for', // for/loop loop (var x of vars)/(num i = 0; i < n; i++)/(boolean) statement
  'break', // break inside a for loop
  'switch', // switch between multiple choices (like an if)
  'pub', // function/class/variable is accessible from other files
  'priv', // function/class/variable is not accessible from other files
  'of', // for for loops
  'typeof', // get the type of a variable at runtime
  'imp', // import public variables
  'new', // create a new object
  'true', // boolean value
  'false' // boolean value
];

// can be followed/preceded by which chars/by which not? TODO
// numbers: -?(0|[1-9][0-9*])(.[0-9]*)?(e[0-9])?
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
  /**
   * Math lib:
   *
   * PI = 3.1415926535897931
   * E = 2.7182818284590451
   * TAU = 6.2831853071795862
   * LN10 = 2.302585092994046
   * LN2 = 0.6931471805599453
   * LOG10E = 0.4342944819032518
   * LOG2E = 1.4426950408889634
   * SQRT1_2 = 0.7071067811865476
   * SQRT2 = 1.4142135623730951
   *
   * abs()
   * sin()
   * asin()
   * cos()
   * acos()
   * acosh()
   * tan()
   * atan()
   *
   * BitDecrement(Double)	Returns the next smallest value that compares less than x.
   * BitIncrement(Double)
   * remainder()
   *
   * Clamp() Returns value clamped to the inclusive range of min and max.
   * CopySign(double magnitude, double sign) Returns the first floating-point argument with the sign of the second floating-point argument.
   */

  public static RunCC(
    mainFile: string,
    otherFiles?: string[],
    headers?: string[],
    settingsFile?: string
  ) {
    mainFile = CCUSPreProcessing.preProcess(
      mainFile,
      [
        { name: 'file1', content: '-' },
        { name: 'file 2', content: `my content " haha " //test` },
        { name: 'useless file', content: '+' }
      ],
      false
    );
    const mainFunctions = this.getTopLevelFunctions(mainFile);

    // console.log('top lvl funcs', mainFunctions);

    if (mainFunctions.every((f) => f.name !== 'Main')) {
      throw new Error(
        'No entrypoint was found! Missing a main function inside the main file.'
      );
    }
  }

  // TODO, CCUS code as string to ASM instructions as string
  public static CCUStoASM(sourceCode: string): {
    originalSourceCode: string;
    tokensOfSourceCode: {
      content: string;
      type: tokenType;
      index: number;
      line: number;
    }[];
    preprocessedSourceCode: string;
    codeLogicTree: any;
    asmInstructions: string[];
  } {
    // @ts-ignore
    return [];
  }

  private static callFunction(func: string, ctx: IFunctionContext): string {
    let curFunc: IFunction | undefined = undefined;
    for (const f of ctx.funcs) if (f.name === func) curFunc = f;
    if (curFunc === undefined)
      throw new Error(
        `Couldn't call the function "${func}" because it wasn't provided.`
      );

    return '';

    function executeCode(code: string[]): string {
      return '';
    }
  }

  // TODO, not use
  private static getTopLevelFunctions(str: string): IFunction[] {
    const chars: string[] = str.split('');
    chars.unshift(' '); // TODO because "func " is not " func "

    let funcKeyWordPos: number = 0;

    // start putting the chars in the cur vars
    let funcNameSave: boolean = false;
    let funcArgsSave: boolean = false;
    let funcBodySave: boolean = false;
    let isFunc: boolean = false;

    // the cur vars who save the values of the current thing
    let curFuncName: string = ''; // can also be at first a type
    let curFuncType: string | undefined;
    let curFuncArgs: string = '';
    let curFuncBody: string = '';

    let funcBodyOpenBrackeds: number = 0;

    let finishedFuncs: IFunction[] = [];

    for (let i = 0; i < chars.length; ++i) {
      // do not check for agrguments if saving the body
      if (!funcBodySave) {
        // check if " func " is written
        if (' func '.split('')[funcKeyWordPos] === chars[i]) {
          funcKeyWordPos++;
          if (funcKeyWordPos === ' func '.split('').length) {
            // func is written
            // save func name
            funcKeyWordPos = 0;
            funcNameSave = true;
            isFunc = true;
            continue;
          }
        }
      }

      if (isFunc) {
        // save name after the keyword "func "
        if (funcNameSave) {
          if (chars[i] === ' ' && this.isValidType(curFuncName)) {
            // func name was not name but type
            curFuncType = curFuncName;
            curFuncName = '';
          } else if (chars[i] === ' ' || chars[i] === '(') {
            // the type & name is over
            funcNameSave = false;
            funcArgsSave = true;
          } else curFuncName += chars[i];
          continue;
        }

        // save the argument string
        if (funcArgsSave) {
          if (chars[i] === '(') continue;
          // not in the string
          else if (chars[i] === ')') funcArgsSave = false;
          // end of string
          else curFuncArgs += chars[i]; // add string
          continue; // skip the rest
        }

        // start saving body
        if (!funcBodySave && chars[i] === '{') {
          funcBodySave = true;
          continue;
        }

        // check if end body or just a char
        if (funcBodySave && chars[i] === '}') {
          if (funcBodyOpenBrackeds !== 0) funcBodyOpenBrackeds--;
          else {
            funcBodySave = false;
            finishedFuncs.push({
              name: curFuncName,
              args: argStringToArgVal(curFuncArgs),
              body: curFuncBody.trimStart().trimEnd(),
              retType: curFuncType as any
            });
            // reset for next same level function
            curFuncName = '';
            curFuncArgs = '';
            curFuncBody = '';
            curFuncType = undefined;
            funcNameSave = false;
            funcArgsSave = false;
            funcBodySave = false;
            isFunc = false;
            continue;
          }
        }

        // save
        if (funcBodySave) {
          // used to have a overview of nested "{}"
          if (chars[i] === '{') funcBodyOpenBrackeds++;
          // save to the main body
          curFuncBody += chars[i];
        }
      }
    }

    for (const func of finishedFuncs)
      if (this.isValidFunc(func) !== true) throw this.isValidFunc(func);

    return finishedFuncs;

    function argStringToArgVal(argStr: string): IFunctionArgument[] {
      if (argStr === '') return [];

      let argVals: IFunctionArgument[] = [];

      const args: string[] = argStr
        .trimStart()
        .trimEnd()
        .split(',')
        .map((s) => s.trimStart().trimEnd());

      for (const arg of args) {
        // TODO better arg parsing
        const argParts: string[] = arg.split(' ');

        argVals.push({
          type: argParts[0] as unknown as Type,
          name: argParts.filter((v, i) => i !== 0).join(' ') // the rest
        });
      }

      return argVals;
    }
  }

  private static getLogicalCodeBlocks(code: string): string[] {
    let blocks: string[] = [];
    const chars: string[] = code.split('');
    for (let i = 0; i < chars.length; ++i) {
      const char: string = chars[i];
      // check if starts with keyword or ends with `;`
    }

    return blocks;
  }

  private static isValidFunc(func: IFunction): Error | boolean {
    if (!isValidIdentifierName(func.name))
      return new Error(`The function "${func.name}" has an invalid name.`);

    for (const arg of func.args) {
      if (!this.isValidType(arg.type))
        return new Error(
          `The function "${func.name}" has an invalid type in it's arguments. Type "${arg.type}" doesn't exist.`
        );
      if (!isValidIdentifierName(arg.name))
        return new Error(
          `The function "${func.name}" has an invalid argument name in it's arguments. The name "${arg.name}" isn't valid.`
        );
    }

    return true;
  }

  private static isValidType(str: Type | string): boolean {
    for (const type in Type) if (str === type) return true;
    return false;
  }

  // ccus test code
  public static testCode = `
  // valid CCS file lol
  def aDef "myVal" // every "aDef" should be replaced with "myVal"
  use "file1" // insert the "file1" file at this position
  def PI 314

  // just some empty line
     PI
  otherDef
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

    str aStr = " Hello\\" world ";

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
  `;
}

// source code gets preprocessed: removing commas, including defs and use
class CCUSPreProcessing {
  /**
   * Pre processing:
   * - Removing comments
   * - Removing whitespaces characters
   * - Process # code: use and def statements
   *
   * @param code The source code to pre process
   * @param header The header files needed for that
   * @param isHeader If the source code is a header file itself
   * @returns Pre processed code
   */
  public static preProcess(
    code: code,
    header?: { name: string; content: code }[],
    isHeader?: boolean
  ): string {
    // #region get all the compiled versions of the other files to use them as header files
    let preCompiledCoFiles: { name: string; content: string }[] = [];

    if (isHeader === true)
      if (isHeader !== true)
        preCompiledCoFiles =
          header?.map((f) => ({
            name: f.name,
            content:
              // compile each map
              this.preProcess(
                f.content, // the content of it
                // every other file could be needed too
                header.filter((subfile) => subfile.name !== f.name), // not the file itself to fix recursion
                true // it's a header file TODO, header else get done twice
              )
          })) ?? [];
    // #endregion

    // remove literals for ez of use
    const literalData: {
      code: string;
      literals: internLiteralsHandling[];
    } = swapLiterals(code);
    code = literalData.code;

    // remove all the comments and whitespaces
    let lines: code[] = this.removeCommentsWhitespaces(code);

    // do the preprocess statements
    code = this.preprocessStatements(lines, literalData.literals);

    // insert all the headers TODO
    // file = insertLiterals(
    //   file,
    //   literalsPlaceholder,
    //   headers.map((def) => ({
    //     literalPlaceholderVal: def.placeholderName,
    //     literalValue: def.value
    //   }))
    // );

    //console.info('final infos', {
    //  file,
    //  defs,
    //  headers,
    //  literals
    //});
    Log(code);

    // reinsert all the literals

    return code;
  }

  /**
   * Remove any comments in the code
   * Comments:
   * - //
   * - /* /
   * - /** /
   *
   * Whitespaces:
   * - '  '
   * - '\t'
   * - '\n'
   *
   * @returns Code without comments
   */
  private static removeCommentsWhitespaces(code: code): code[] {
    // format code and split them by line (for the rest)
    // attention: this is before the check for preCompile statements!!

    // remove comments
    code = code.replace(commentRegex, '');

    // remove whitespaces
    code = code
      .replace(/\t/g, ' ') // removes tabs
      .replace(/\n/g, ' \n ') // bug prevention with removed spaces
      .replace(/ +\n[\n ]+/g, ' \n') // remove double spaces splitted over lines (" \n ")
      .replace(/  +/g, ' '); // replace all double spaces (on a single line) with a single space

    return code
      .split('\n') // split the lines
      .filter((s) => !s.match(/^ *$/g)); // remove empty strings in the array;
  }

  // e.g. `code $0$ code` => `code "sub" code`
  private static insertLiterals(
    code: code,
    placeholderForm: RegExp,
    literalsData: internLiteralsHandling[]
  ): code {
    return code.replace(
      placeholderForm, // everything in the specified format
      (
        placeholder // for every literal inside the main string
      ) =>
        literalsData.find(
          // check if literal includes a placeholder name which is identical to a placeholder in the code
          (literal) => literal.literalPlaceholder === placeholder
        )?.literalValue ?? placeholder // replace it with the value if not undefined (the first ?)
      // if undefined, replace it with itself again (the second ??)
    );
  }

  private static preprocessStatements(
    lines: code[],
    literals: internLiteralsHandling[]
  ): code {
    let preCompileStatements: string[] = [];
    for (const line of lines) {
      // get all the use/inc and def statments
      if (!!line.match(isDefStatement))
        preCompileStatements.push(line.match(isDefStatement)![0]);
      // if (!!line.match(isUseStatement))
      //   preCompileStatements.push(line.match(isUseStatement)![0]);
    }

    let defs: { placeholderName: string; value: string }[] = []; // def statements
    let headers: string[] = []; // use/inc files
    for (const pre of preCompileStatements) {
      lines = lines
        .map((s) => s.replace(pre, '').replace(/  +/g, ' ')) // remove precompile str from the line and fix any double spaces
        .filter((s) => s !== '' && s !== ' '); // remove empty lines

      if (!!pre.match(isDefStatement)) {
        // is a def statement, TODO add them to the main string later
        defs.push({
          placeholderName: pre.split(' ')[1],
          value: pre.split(' ')[2]
        });
      }
      // if (!!pre.match(isUseStatement)) {
      //   // is a use thing, TODO add them to the main string later
      //   headers.push(pre.split(' ')[1].trimEnd());
      // }
    }
    // replace placeholder values in defs and headers to main values
    defs = defs.map((def) => ({
      placeholderName: def.placeholderName,
      value: this.insertLiterals(def.value, literalPlaceholder, literals)
    }));
    headers = headers.map((header) =>
      this.insertLiterals(header, literalPlaceholder, literals)
    );

    // TODO def and header/use/inc

    // reinsert all the literals, which where removed at the beginning
    let code = this.insertLiterals(
      lines.join(''),
      literalPlaceholder,
      literals
    );

    // insert all the defs
    code = this.insertLiterals(
      code,
      /([a-zA-Z])([a-zA-Z0-9])*/g,
      defs.map((def) => ({
        literalPlaceholder: def.placeholderName,
        literalValue: def.value
      }))
    );

    return code;
  }
}

// preprocessed source code gets down to simpler code (asm)
class CCUSCompiling {
  // get all the tokens of the code ("int" is a token and "++" too)
  static Lexer = class {
    public static Lexer(code: code): [token, tokenType][] {
      const tokens: [token, tokenType][] = [];

      // get literals
      const removedLiterals: {
        literals: internLiteralsHandling[];
        code: code;
      } = swapLiterals(code);
      const literalData: internLiteralsHandling[] = removedLiterals.literals;
      const codeWithoutLiterals: code = removedLiterals.code;

      let lastTokenState: tokenType = tokenType.none;
      let curInput: string = '';
      // go through each character and sort them together
      for (const char of codeWithoutLiterals) {
        // TODO, spacebar means it is finished
        const curTestInput: string = curInput + char;

        const oldTokenType: tokenType = getTokenType(curInput);
        const newTokenType: tokenType = getTokenType(curTestInput);

        if (newTokenType === tokenType.literal) {
          // can be nothing else, because literals are replaced with unic $ symbol
          tokens.push([curTestInput, tokenType.identifier]);
          curInput = '';
          continue;
        }

        if (newTokenType === tokenType.none) {
          // it was probably before something
          // ret -> retu -> return, once correct, after wrong, then correct again
          if (
            oldTokenType === tokenType.keyword &&
            newTokenType === tokenType.none
          ) {
            tokens.push([curTestInput, tokenType.identifier]);
            curInput = '';
            continue;
          } else if (
            oldTokenType === tokenType.keyword &&
            newTokenType === tokenType.none
          ) {
          }
        }

        // no one hit
        // so curInput could be right while it with the next char not
        // or curInput isnt a valid symbol yet
        // check if last input was ready enough
        // own function which returns what it is

        // check if literal placeholder
        // check if symbol
        // check if keyword
        // check if identifier
      }

      // return the answer
      return tokens;

      function couldBeKeyword(str: string): string[] {
        let possibilities: string[] = [];
        for (const k of keywords)
          if (k.startsWith(str)) possibilities.push(str);
        return possibilities;
      }

      function couldBeSymbol(str: string): string[] {
        let possibilities: string[] = [];
        for (const s of symbols) if (s.startsWith(str)) possibilities.push(str);
        return possibilities;
      }

      function isLiteralPlaceholder(str: string): boolean {
        return !!str.match(literalPlaceholder);
      }

      function isSymbol(str: string): boolean {
        return symbols.includes(str);
      }

      function isKeyword(str: string): boolean {
        return keywords.includes(str);
      }

      function isIdentifier(str: string): boolean {
        return isValidIdentifierName(str);
      }

      function getTokenType(str: string): tokenType {
        let ans: tokenType = tokenType.none;

        if (isLiteralPlaceholder(str)) ans = tokenType.literal;
        else if (isSymbol(str)) ans = tokenType.symbol;
        else if (isKeyword(str)) ans = tokenType.keyword;
        else if (isIdentifier(str)) ans = tokenType.identifier;

        return ans;
      }
    }
  };

  // get the syntax of every statement => parse tree
  static syntaxAnalyser = class {};

  // identifier table
  static semanticAnalyser = class {};

  // optimization of asm code
  static optimizer = class {
    // e.g. "x = x + 3" == "x += 3"
  };
}

// simple code (asm) gets executed
class CCUSExecuting {}

// interprets CCUS in real time
class CCUSInterpreter {}

const str = `
f = g/**//h;
  g // comment
  test /*

  comment 2

  */
  true
  false
  +3.e3
  "lel \\"  uff"
  /*//*/ l();

  m = n//**/o
+ p;
`;

const preprocessedCode: code = CCUSPreProcessing.preProcess(str);
console.log(CCUSCompiling.Lexer.Lexer(preprocessedCode));

//CCUS.RunCC(CCUS.testCode);
