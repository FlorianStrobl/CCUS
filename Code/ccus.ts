// CCUS 1.1.0
// parallel tasks (gpu, async-promise-await)
// html, css, latex and regex equivalent string options
// systemverilog

import { getCode } from './fileReader';

// TODO char literals, array literals

/* parser:
 * literal;
 * let static? const? read? identifier;
 * let static? const? read? identifier = literal | identifier | mathExpression;
 * if (bit | bitExpression) statement
 * for (bit) // while
 * for (number) statement
 * for (let static? const? read? identifier : identifier | arrayLiteral) statement // TODO destructor
 */

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

interface detailedToken extends token {
  detailedType: detailedTokenType;
}

enum detailedTokenType {
  none = 0, // invalid token type
  strLiteral = 1,
  charLiteral = 2,
  numLiteral = 3,
  identifier = 4,
  keyword = 5,
  symbol = 6
}

enum tokenType {
  whitespaces = 0, // \n,  , \t
  comment = 1, // //comment
  keyword = 2, // func, num
  symbol = 3, // +, -, ()
  literals = 4, // 0, true, "hello"
  identifier = 5 // myFunction, myVariable
}

enum keywordTypes {
  type = 0, // intX, str
  definition = 1, // func, op
  statement = 2 // if, break
}
// #endregion

// #region const
const CCUSheader: str = `
def false (bit)0
def true (bit)1
`;

const CCUSSettingsHeader: str = `

`;

const CCUSFile: str = `use "ccus"
use "ccussettings"
`;

// TODO serial vs parallel, async
const keywords: {
  content: str; // raw string for keyword (/[_a-zA-Z][0-9a-zA-Z]*/
  lexem?: bool; // if the lexer should check for this keyword
  description?: str; // description for what this keyword is for
  type?: keywordTypes; // intX if a type, func is a definition
}[] = [
  {
    content: 'str',
    lexem: true,
    description: `Type for character arrays. # TODO needed if class itself`,
    type: keywordTypes.type
  },
  {
    content: 'num',
    lexem: true,
    description: `A variable type for every valid numeric type.`
  },
  {
    content: 'bit',
    lexem: true,
    description: `A variable type for the integers 0 and 1.
    This type behaves differently than the intX types.
    Other languages may call this type "boolean".`
  },
  {
    content: 'int8',
    lexem: true,
    description: `A variable type for integers.
    Variables of this type take 8 bits, also called 1 byte.
    Integers of this type can be between -128 and 127 (-2**7 to 2**7 - 1).`
  }, // integers
  { content: 'int16', lexem: true },
  { content: 'int32', lexem: true },
  { content: 'int64', lexem: true },
  { content: 'intn', lexem: true }, // big int
  { content: 'uint8', lexem: true }, // unsigned int
  { content: 'uint16', lexem: true },
  { content: 'uint32', lexem: true },
  { content: 'uint64', lexem: true },
  { content: 'float16', lexem: true }, // decimal numbers (needed?)
  { content: 'float32', lexem: true },
  { content: 'float64', lexem: true },
  { content: 'float128', lexem: true },
  { content: 'float256', lexem: true }, // ieee754 octuple precision (needed?)
  { content: 'decimal32', lexem: true }, // string formated floats (needed?)
  { content: 'decimal64', lexem: true },
  { content: 'decimal128', lexem: true },
  { content: 'decimal256', lexem: true }, // (needed?)
  { content: 'decimal512', lexem: true }, // (needed?)
  { content: 'char8', lexem: true }, // integer which can get read as a character/string
  { content: 'charn', lexem: true }, // like UTF-8 variable size
  { content: 'use', lexem: true }, // use/include (/inc??) a (header, ccus) file
  { content: 'def', lexem: true }, // define a placeholder name for a value (preprocess)
  { content: 'imp', lexem: true }, // import public variables/functions/classes
  { content: 'func', lexem: true }, // define a function
  { content: 'interface', lexem: true }, // for let or class
  { content: 'let', lexem: true }, // create a variable without specifing the type
  { content: 'class', lexem: true }, // define a class
  { content: 'enum', lexem: true }, // aliase from string to other type
  { content: 'op', lexem: true }, // operater overloading
  { content: 'iterator', lexem: true }, // TODO, for classes
  { content: 'ret', lexem: true }, // return from function
  { content: 'throw', lexem: true }, // error occured TODO (execption handling like that??)
  { content: 'const', lexem: true }, // constant variable/function (like static)
  { content: 'static', lexem: true }, // needed inside classes because const?
  { content: 'ref', lexem: true }, // referenz variable (can change value inside other context)
  { content: 'if', lexem: true }, // if statements
  { content: 'else', lexem: true }, // previous if statement was not executed so execute this statement (like an if)
  { content: 'for', lexem: true }, // for/loop loop (var x of vars)/(num i = 0; i < n; i++)/(boolean)/(number??) statement
  { content: 'switch', lexem: true }, // switch between multiple choices (like an if)
  { content: 'break', lexem: true }, // break inside a for loop/switch
  { content: 'pub', lexem: true }, // function/class/variable is accessible from other files/classes
  { content: 'priv', lexem: true }, // function/class/variable is not accessible from other files/classes/contextes
  { content: 'prot', lexem: true }, // function/class/variable is only accessible by derived classes
  { content: 'of', lexem: true }, // for for loops
  { content: 'typeof', lexem: true }, // get the type of a variable at runtime
  { content: 'new', lexem: true }, // create a new object
  { content: 'false', lexem: false }, // boolean literal (not actually since it is a def)
  { content: 'true', lexem: false }, // boolean literal (not actually since it is a def)
  { content: 'main', lexem: false }, // entrypoint function
  { content: 'out', lexem: false }, // output to user
  { content: 'in', lexem: false } // input from user
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
  '...', // unpack operator
  "'" // char
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
// #endregion

class CCUS {
  constructor() {}

  /**
   *
   */
  public static ASMinterpreter(asmInstructions: str[]): void {}

  /**
   *
   */
  public static CCUStoASM(
    sourceCode: str,
    sources?: str[] // other files for use statement/keyword
  ): {
    originalSourceCode: str;
    tokensOfSourceCode: token[];
    preprocessedSourceCode: token[];
    codeLogicTree: t;
    asmInstructions: str[];
  } {
    // TODO recursiv fix headerFile use statements

    const originalSourceCode: str = sourceCode; // save the original code
    sourceCode = sourceCode + '\n' + CCUSFile; // add the default header, at the end because line count is wrong else

    // lexer/tokenizer
    const tokens: token[] = this.getTokens(sourceCode);

    // filter comments and give the tokens more detailed descriptions
    const importantTokens: detailedToken[] = this.updateTokens(tokens);

    // check global folder for headers, then project folder and then local files
    const preprocessedCode: { detailedTokens: detailedToken[]; uses: str[] } =
      this.preprocess(importantTokens);

    console.log(preprocessedCode);

    const logicTree: any = this.logicAnalyser(preprocessedCode.detailedTokens);

    const optimisedTree: any = this.optimiseTree(logicTree);

    return {
      originalSourceCode: originalSourceCode,
      tokensOfSourceCode: tokens,
      preprocessedSourceCode: preprocessedCode.detailedTokens,
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
      | tokenType.literals
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
    const symbolsRegex: RegExp = new RegExp(
      symbols
        .sort((a, b) => (a.length < b.length ? 1 : -1))
        .map((e) => e.replace(escapeStringForRegex, '\\$&'))
        .reduce((prev, cur) => prev + '|' + cur),
      'g'
    );
    const identifierRegex: RegExp = /[_a-zA-Z][a-zA-Z0-9]*/g;
    // TODO .5, 0x
    const literalsRegex: RegExp =
      /(?:(?:0[bBdDoO])?[_0-9]+(?:.[_0-9]+)?(?:[eEpP][+-]?[_0-9]+)?)|(?:'(?:[0-9a-zA-Z_+\-*/@$#=]|\\n[0-9]{1,4})'[a-z]?)/g;

    function replacer(match: str, offset: num, string: str): str {
      const token: token = {
        content: match,
        type: lastUsedType,
        index: offset,
        line: CCUS.getPosition(offset, string).line,
        column: CCUS.getPosition(offset, string).column
      };

      // index of the start of the line
      let indexOfStart: num = string.slice(0, offset).lastIndexOf('\n');
      if (indexOfStart === -1) indexOfStart = 0;
      // index of the end of the line
      // const indexOfEnd: num =
      //   string
      //     .slice(indexOfStart + 1)
      //     .split('')
      //     .indexOf('\n') +
      //   indexOfStart +
      //   2;
      // the current line of code
      //const lineOfCode: str = string.slice(indexOfStart, indexOfEnd);

      switch (lastUsedType) {
        case tokenType.symbol:
          _symbols.push(token);
          break;
        case tokenType.literals:
          // only numbers
          literals.push(token);
          break;
        case tokenType.identifier:
          // TODO fix chars
          if (string[offset - 1] === "'" || string[offset - 2] === "'")
            return match;
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
            type: tokenType.literals,
            index: lastIndex,
            line: CCUS.getPosition(lastIndex, code).line,
            column: CCUS.getPosition(lastIndex, code).column
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
            line: CCUS.getPosition(lastIndex, c).line,
            column: CCUS.getPosition(lastIndex, c).column
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
            line: CCUS.getPosition(lastIndex, c).line,
            column: CCUS.getPosition(lastIndex, c).column
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
          type: tokenType.literals,
          index: lastIndex,
          line: CCUS.getPosition(lastIndex, c).line,
          column: CCUS.getPosition(lastIndex, c).column
        });
      } else if (inComment === true) {
        // commit and ignore the rest
        com.push({
          content: curContent,
          type: tokenType.comment,
          index: lastIndex,
          line: CCUS.getPosition(lastIndex, c).line,
          column: CCUS.getPosition(lastIndex, c).column
        });
      }

      // TODO special types of strings
      // j == json literal, r == regex literal, h == html literal, f == formatted, l == latex, m == markdown
      for (const e of strs)
        if (e.content.length + e.index < c.length)
          if (
            ['j', 'r', 'h', 'f', 'l', 'm'].includes(
              c[e.content.length + e.index]
            )
          )
            e.content += c[e.content.length + e.index];

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

    // get all the identifiers and replace them with whitespaces
    lastUsedType = tokenType.identifier;
    code = code.replace(identifierRegex, replacer);

    // get all the keywords and replace them with whitespaces
    identifiers = identifiers.filter((e) => {
      if (
        keywords.some((kw) => kw.content === e.content && kw.lexem === true)
      ) {
        e.type = tokenType.keyword;
        _keywords.push(e);
        return false;
      } else return true;
    });

    // get all the literals and replace them with whitespaces
    lastUsedType = tokenType.literals;
    code = code.replace(literalsRegex, replacer);

    // get all the symbols and replace them with whitespaces
    lastUsedType = tokenType.symbol;
    code = code.replace(symbolsRegex, replacer);

    // check if there are remaining characters
    if (code.match(/[\n\t ]*/g)?.join('') !== code) {
      // TODO more than one error

      let indexOfErr: num = 0; // raw index

      for (let i = 0; i < code.length; ++i)
        if (code[i] !== '\n' && code[i] !== '\t' && code[i] !== ' ') {
          indexOfErr = i;
          break;
        }

      let line: num = CCUS.getPosition(indexOfErr, code).line;

      let column: num = CCUS.getPosition(indexOfErr, code).column;

      // TODO now correct errors
      let errorMsg: str =
        `[LEXER]: Unresolved characters in source code at line ${line} and columne ${column}: ` +
        code
          .match(/[^\n\t]*/g)
          ?.filter((s) => s.replace(/ /g, '').length !== 0)[0]
          .replace(/ /g, '');

      console.error(errorMsg);
    }

    // TODO check for "'" + char + "'"

    return [
      ...comments,
      ..._keywords,
      ..._symbols,
      ...literals,
      ...identifiers
    ].sort((a, b) => (a.index <= b.index ? -1 : 1));
  }

  private static updateTokens(tokens: token[]): detailedToken[] {
    // remove whitespaces and comments
    tokens = tokens.filter(
      (t) => t.type !== tokenType.whitespaces && t.type !== tokenType.comment
    );

    const detailedTokens: detailedToken[] = [];
    for (const t of tokens) {
      const curContent: str = t.content;
      const curType:
        | tokenType.literals
        | tokenType.keyword
        | tokenType.symbol
        | tokenType.identifier = t.type as any;

      if (curType === tokenType.literals) {
        // TODO replace with regex
        if (curContent.startsWith('"'))
          detailedTokens.push({
            ...t,
            detailedType: detailedTokenType.strLiteral
          });
        else if (curContent.startsWith("'"))
          detailedTokens.push({
            ...t,
            detailedType: detailedTokenType.charLiteral
          });
        else
          detailedTokens.push({
            ...t,
            detailedType: detailedTokenType.numLiteral
          });
      } else if (curType === tokenType.identifier) {
        detailedTokens.push({
          ...t,
          detailedType: detailedTokenType.identifier
        });
      } else if (curType === tokenType.keyword) {
        // TODO
        detailedTokens.push({ ...t, detailedType: detailedTokenType.keyword });
      } else if (curType === tokenType.symbol) {
        // TODO
        detailedTokens.push({ ...t, detailedType: detailedTokenType.symbol });
      } else {
        detailedTokens.push({ ...t, detailedType: detailedTokenType.none });
      }
    }

    return detailedTokens;
  }

  private static preprocess(tokens: (detailedToken | null)[]): {
    detailedTokens: detailedToken[];
    uses: str[];
  } {
    let useHeaders: str[] = [];
    let defs: { literal: str; value: str }[] = [];
    // `use str (ONLY STR LITERAL, none id or var)` and `def id any \n` keywords
    // get all the use and def preprocessor statements
    // check if some use statements are double
    // check if some def statements are double
    // resolve use statements
    // resolve def statements
    // `def once` / `use once` for #pragma once?

    // "use" keyword
    for (let i = 0; i < tokens.length; ++i) {
      const token: detailedToken | null = tokens[i];

      if (token !== null && token.content === 'use') {
        if (
          tokens.length > i + 1 &&
          tokens[i + 1]?.detailedType === detailedTokenType.strLiteral
        ) {
          if (tokens[i + 1] !== null) useHeaders.push(tokens[i + 1]!.content);
          tokens[i] = null; // remove the keyword and the string literal
          tokens[i + 1] = null;
          ++i; // do not check the next token (because it is the string literal)
        } else {
          // error used keyword `use` wrong because i+1 is not string literal
          console.error(
            '[Preprocessor]: invalid use of the "use" keyword (keyword was not followed by a string literal).'
          );
        }
      }
    }

    // "def" keyword
    for (let i = 0; i < tokens.length; ++i) {
      const token: detailedToken | null = tokens[i];

      if (token === null) continue;

      if (token.content === 'def') {
        // go through all indexes after this until the token is on the next line
        // TODO check only the line after the identifier and not if it is on the same line as the def keyword
        const curLine: num = token.line;

        if (
          tokens[i + 1] !== null &&
          tokens.length > i + 1 &&
          tokens[i + 1]!.detailedType === detailedTokenType.identifier
        ) {
          // TODO empty value or set to 1 for boolean?
          defs.push({ literal: tokens[i + 1]!.content, value: '1' });
          tokens[i] = null; // dont need the keyword token anymore
        } else {
          console.error(
            '[Preprocessor]: Invalid use of the "def" keyword (keyword was not followed by an identifier).'
          );
        }

        // TODO multi token definition
        if (
          tokens[i + 1] !== null &&
          tokens[i + 2] !== null &&
          tokens.length > i + 2 &&
          tokens[i + 1]!.line === tokens[i + 2]!.line
        ) {
          defs[defs.length - 1].value = tokens[i + 2]!.content;
          tokens[i + 1] = null; // dont need the identifier anymore
          tokens[i + 2] = null; // dont need the value anymore
        } else {
          console.warn(
            '[Preprocessor]: Invalid use of the "def" keyword (keyword and identifier was not followed by a value on the same line).'
          );
        }
      }
    }

    // remove finished tokens part 2
    tokens = tokens.filter((e) => e !== null);

    tokens.map((t) => {
      // skip any none identifier types
      if (t?.detailedType !== detailedTokenType.identifier) return t;

      let possibleDefs: {
        literal: str;
        value: str;
      }[] = defs.filter((d) => d.literal === t.content);

      // skip if it is a keyword not specified as a def
      if (possibleDefs.length === 0) return t;

      if (defs.length !== 1) {
        // TODO error
        console.error(
          '[Preprocessor]: Invalid use of identifires for the "def" keyword (TODO INFO)'
        );
      } else if (t !== null) t.content = possibleDefs[0].value;

      return t;
    });

    // TODO probably just make a list of to get header files (use)
    // and resovle them at a later stage to fix recursiv problems

    // TODO
    // @ts-ignore
    return { detailedTokens: tokens === null ? [] : tokens, uses: useHeaders };
  }

  private static logicAnalyser(tokens: detailedToken[]): t {}

  private static optimiseTree(logicTree: t): t {}

  private static getPosition(
    rawIndex: num,
    str: str
  ): { line: num; column: num } {
    return {
      line:
        str
          .slice(0, rawIndex)
          .split('')
          .filter((e) => e === '\n').length + 1, // linesBeforeMatch.length,
      column: rawIndex - 1 - str.slice(0, rawIndex).lastIndexOf('\n') // (offset) - lastLine (TODO what if no \n => -1)
    };
  }
}

const sourceCode0: str = `
use "test"
/*def once*/
def y "str"

// f(x) = y
func f(num x /* important comment */ ) {
  char8 c = 'a'; // TODO add char literal
  char8 c2 = '\\n51';
  str s = "my string"j;
  ret y + 3;
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
CCUS.CCUStoASM(getCode());
console.timeEnd();
