import { logger as log } from './logging';

type int = number;
type str = string;
type char = string;
type bool = boolean;

export namespace lexer {
  // #region internal
  // a "word"/token in the source code
  export interface lexem {
    content: str; // raw value
    type: tokenType; // keyword, literal, ...
    index: int; // raw index in the string
    line: int; // how many \n are before the content
    column: int; // position in the line
  }

  export const enum tokenType {
    whitespaces = 'whitespace', // any of: ["\n", " ", "\t"]
    comment = 'comment', // "// singleline comment" or "/*multiline comment*/" (are considered whitespace)
    keyword = 'keyword', // reserved identifiers: ["func", "bit", ...]
    symbol = 'symbol', // reserved non-alphanumeric identifiers with length 1 or 2: ["+", "-", "()", ...]
    literal = 'literal', // any of these types: [0, 0.0, 'a', "hello world"]
    identifier = 'id' // alphanumeric words like "myFunction", "myVariable", "true", "false"
  }

  const symbols: str[] = [
    '.', // seperator
    ',', // enumerator? TODO
    ';', // seperator, whitespace
    '?', // for tenary
    ':', // for tenary
    '(', // grouping
    ')', // grouping
    '{', // grouping
    '}', // grouping
    '[', // grouping
    ']', // grouping
    '=', // assigment
    '+', // math
    '-', // math
    '*', // math
    '/', // math
    '<', // bool, math
    '>', // bool, math
    '<=', // bool, math
    '>=', // bool, math
    '!', // bool
    '==' // bool
    //'...' // TODO, multiple args, or array/enumerator
    /**
     * _ for numbers and identifier/keywords
     * \ for string escape
     */
  ];

  const keywords: str[] = [
    'bit',
    'let',
    'func',
    'return',
    'if',
    'for',
    'match'
  ];

  // string modifier like "character", "regex", ...
  const stringMod: char[] = ['r', 'c'];

  let currentIndex: int = 0;
  let code: str = '';
  // #endregion

  export function lexer(source: str): lexem[] {
    const startTime: int = Date.now();

    code = source;
    const lexems: lexem[] = [];
    let invalidLexems: [char: char, index: int][] = [];

    // #region main loop
    for (let i = 0; i < source.length; ++i) {
      if (currentIndex !== i)
        log.error(
          'lexer',
          `internal error: currentIndex (${currentIndex}) != i (${i})`
        );

      if (isWhitespace(curChar())) {
        // whitespace check => do nothing
      } else if (
        curChar() === '/' &&
        (nextChars() === '/' || nextChars() === '*')
      ) {
        // comment check => captchure the comment
        const startingIndex: int = currentIndex;

        const ans = eatComment(nextChars() === '/');

        i += ans.charCount;

        lexems.push({
          content: ans.comment,
          type: tokenType.comment,
          index: startingIndex,
          line: getLinePos(startingIndex),
          column: getColumnPos(startingIndex)
        });
      } else if (!!curChar().match(/^"$/)) {
        // started string
        const startingIndex: int = currentIndex;

        const ans = eatString();

        i += ans.charCount;

        lexems.push({
          content: ans.str,
          type: tokenType.literal,
          index: startingIndex,
          line: getLinePos(startingIndex),
          column: getColumnPos(startingIndex)
        });
      } else if (startLikeSymbol(curChar())) {
        // symbol check => check if two character symbol
        if (isSymbol(curChar() + nextChars())) {
          lexems.push({
            content: curChar() + nextChars(),
            type: tokenType.symbol,
            index: currentIndex,
            line: getLinePos(),
            column: getColumnPos()
          });

          // because next character already consumed
          advance();
          i++;
        } else {
          lexems.push({
            content: curChar(),
            type: tokenType.symbol,
            index: currentIndex,
            line: getLinePos(),
            column: getColumnPos()
          });
        }
      } else if (isDigit(curChar())) {
        // is a numeric literal
        const startingIndex: int = currentIndex;

        const ans = eatNumber();

        i += ans.charCount;

        if (ans.valid)
          lexems.push({
            content: ans.number,
            type: tokenType.literal,
            index: startingIndex,
            line: getLinePos(startingIndex),
            column: getColumnPos(startingIndex)
          });
        else invalidLexems.push([ans.number, startingIndex]);
      } else if (isAlpha(curChar())) {
        // is identifier or keyword

        const startingIndex: int = currentIndex;

        const ans = eatIdentifier();

        i += ans.charCount;

        lexems.push({
          content: ans.identifier,
          type: keywords.includes(ans.identifier)
            ? tokenType.keyword
            : tokenType.identifier,
          index: startingIndex,
          line: getLinePos(startingIndex),
          column: getColumnPos(startingIndex)
        });
      } else invalidLexems.push([curChar(), currentIndex]); // error

      advance(); // increase the currentIndex
    }
    // #endregion

    log.log('lexer', `finished lexing in ${Date.now() - startTime} ms`);

    //log.printErrors(code, invalidLexems);

    log.logInfo(code, [
      { index: 10, length: 4, message: 'invalid number literal' },
      { index: 5, length: 2, message: 'invalid number literal' }
    ]);

    return lexems;
  }

  // #region helper functions
  // #region meta functions
  function curChar(): char {
    return code[currentIndex];
  }

  function nextChars(count: int = 1): str {
    return code.slice(currentIndex + 1, currentIndex + 1 + count);
  }

  function advance(): bool {
    currentIndex++;
    return currentIndex === code.length;
  }
  // #endregion

  // #region eat
  // TODO check if line end
  function eatComment(singleLineComment: bool): {
    charCount: int;
    comment: str;
  } {
    let comment: str = '';

    while (true) {
      if (singleLineComment) {
        if (curChar() === '\n') break;
        comment += curChar();
        if (advance()) break;
      } else {
        if (curChar() === '*' && nextChars() === '/') {
          comment += '*/'; // do this, as it isnt done anymore...
          if (advance()) break; // advance, because of "*"
          break;
        } else {
          comment += curChar();
          if (advance()) break;
        }
      }
    }

    return { charCount: comment.length - (singleLineComment ? 0 : 1), comment };
  }

  function eatIdentifier(): {
    charCount: int;
    identifier: str;
  } {
    let identifier: str = '';

    while (isAlphaNumeric(curChar())) {
      identifier += curChar();
      if (advance())
        // is at line end!
        break;
    }

    currentIndex--; // because we eat one too much!!
    return { charCount: identifier.length - 1, identifier };
  }

  function eatNumber(): { charCount: int; number: str; valid: bool } {
    const numeric: RegExp = /[0-9A-Fa-f_.eE+-]/; // TODO what about 4z // this is not valid as z is directly besides 4
    let number: str = curChar();

    if (curChar() === '0' && nextChars() === 'b') {
      // number is in the binary binary format
      number += 'b';
      advance();

      // the second one to check for invalid identifiers and keywords
      while (!!nextChars().match(numeric) || !!nextChars().match(/[a-zA-Z_]/)) {
        //while (!nextChars().match(/ |\t|\n/)) {
        number += nextChars();
        advance();
      }
    } else if (curChar() === '0' && nextChars() === 'x') {
      // hex format
      number += 'x';
      advance();

      while (!!nextChars().match(numeric) || !!nextChars().match(/[a-zA-Z_]/)) {
        //while (!nextChars().match(/ |\t|\n/)) {
        number += nextChars();
        advance();
      }
    } else {
      // decimal format

      while (!!nextChars().match(numeric) || !!nextChars().match(/[a-zA-Z_]/)) {
        //while (!nextChars().match(/ |\t|\n/)) {
        number += nextChars();
        advance();
      }
      // let gotDot: bool = false;
      // let gotE: bool = false;
      // let lastCharWasE: bool = false; // for optionall sign after the e
      // let lastCharDigit: bool = true;

      // // look into the future
      // while (true) {
      //   // get all the underscores
      //   if (
      //     nextChars() === '_' &&
      //     lastCharDigit &&
      //     nextChars(2)[1] !== undefined &&
      //     isDigit(nextChars(2)[1])
      //   ) {
      //     lastCharDigit = false;
      //     number += nextChars();
      //     advance();
      //   }

      //   if (lastCharWasE) {
      //     lastCharWasE = false;
      //     lastCharDigit = false;
      //     if (!!nextChars().match(/[+-]/)) {
      //       // +- after e
      //       number += nextChars();
      //       advance();
      //       continue;
      //     } // else just continue
      //   }

      //   if (isDigit(nextChars())) {
      //     // digit
      //     lastCharDigit = true;
      //     number += nextChars();
      //     advance();
      //   } else if (nextChars() === '.' && !gotDot && !gotE) {
      //     // .
      //     gotDot = true;
      //     lastCharDigit = false;
      //     number += nextChars();
      //     advance();
      //   } else if (nextChars().toLowerCase() === 'e' && !gotE) {
      //     // e
      //     gotE = true;
      //     lastCharWasE = true;
      //     lastCharDigit = false;
      //     number += nextChars();
      //     advance();
      //   } else break;
      // }
    }

    return {
      charCount: number.length - 1,
      number,
      valid:
        !!number.match(/^0b([01]_?)+[01]$/) ||
        !!number.match(/^0x([0-9a-fA-F]_?)+[0-9a-fA-F]$/) ||
        // todo nothing between . and e, trailling .
        !!number.match(/^\d(_?\d)*(((\.)(\d_?)*\d)|\.)?([eE][-+]?(\d_?)*\d)?$/)
    };
  }

  function eatString(): { charCount: int; str: str } {
    let str: str = '';

    while (true) {
      // handle "\n", "\t", \uxxxx and escaped \  "\\"
      if (curChar() !== '\\' && nextChars() === '"') {
        // stop string next char
        str += curChar();
        advance();

        // check if the next char is a single and valid string type character
        if (
          stringMod.includes(nextChars()) &&
          // check if it is not an identifier/keyword
          (nextChars(2)[1] === undefined || !isAlphaNumeric(nextChars(2)[1]))
        ) {
          str += '"' + nextChars();
          advance();
        } else str += '"';

        break;
      } else {
        str += curChar();
        advance();
      }
    }

    return {
      charCount: str.length - 1, // check first the size
      str: str // then modify it
        .replace(/\\\\|\\t|\\n/g, (match) => {
          // function because of \\\\n, which could get parsed first into \n and then leaving the \\\ to be processed
          switch (match) {
            case '\\\\':
              return '\\';
            case '\\t':
              return '\t';
            case '\\n':
              return '\n';
            default:
              return match;
          }
        })
        .replace(/\\u(\d{4})/, (_, digits) =>
          String.fromCharCode(Number('0x' + (digits as string)))
        )
    };
  }
  // #endregion

  // #region is
  function isWhitespace(char: char): bool {
    return !!char.match(/^(?: |\t|\n)$/);
  }

  function isAlpha(char: char): bool {
    return !!char.match(/^[a-zA-Z_]$/);
  }

  function isAlphaNumeric(char: char): bool {
    return !!char.match(/^[a-zA-Z0-9_]$/);
  }

  function isDigit(char: char): bool {
    return !!char.match(/^[0-9]$/);
  }

  function startLikeSymbol(char: char): bool {
    // only checks for the first character of every symbol
    return symbols.map((str) => str[0]).includes(char);
  }

  function isSymbol(str: str): bool {
    return symbols.includes(str);
  }
  // #endregion

  // #region get position
  function getLinePos(index: int = currentIndex): int {
    return (code.slice(0, index + 1).match(/\n/g) || []).length + 1;
  }

  function getColumnPos(index: int = currentIndex): int {
    // offset - charCountUntilLastLine
    return index - code.slice(0, index + 1).lastIndexOf('\n');
    // (lastIndexOf===-1) is ok,
    // as it is (- (-1)) => (index + 1); and this is occuring then (index===0)
  }

  // get the line in which this index exists
  function getLine(index: int = currentIndex): str {
    if (index >= code.length) return '';

    let ans: str = '';
    let inStr: bool = false;

    for (let i = 0; i < code.length; ++i) {
      if (i === index) inStr = true;

      if (code[i] === '\n')
        if (!inStr) ans = '';
        else break;
      else ans += code[i];
    }

    return ans;
  }
  // #endregion
  // #endregion
}

console.log(
  // TODO lex empty string, lex string with space, lex string with single invalid character
  // TODO last char == "\n" vs not (and then last char invalid or not)
  // 0b10_1010___1_ // invalid
  // 3_1_1.1e-1_1 // valid
  // 0b1_0_1_0_1 // valid
  // 0b_1_ // invalid
  // 0b1_ // invalid
  //let _varißble = #$ \`sub\` + $ 'string';
  //0b_ // invalid
  lexer.lexer(`
let 0n = 5.0z;
a
`)
);
