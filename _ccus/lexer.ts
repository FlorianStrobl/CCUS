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
    ';',
    '.',
    ',',
    '(',
    ')',
    '{',
    '}',
    '[',
    ']',
    '=',
    '==',
    '+',
    '<='
  ];

  const keywords: str[] = ['bit', 'func', 'for', 'return'];

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
        error(`internal error: currentIndex (${currentIndex}) != i (${i})`);

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

        lexems.push({
          content: ans.number,
          type: tokenType.literal,
          index: startingIndex,
          line: getLinePos(startingIndex),
          column: getColumnPos(startingIndex)
        });
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

    log(`finished lexing in ${Date.now() - startTime} ms`);

    printErrors(invalidLexems);

    return lexems;
  }

  function printErrors(invalidLexems: [char: char, index: int][]): void {
    if (invalidLexems.length === 0) return;

    /**
     * get errors from each line, generate a ^^ message underling all of the mistakes
     * (check for column==0 and column==end...)
     * make it dynamic such that the error msg can be adjusted fastly
     */

    // #region merge following characters, TODO needed if
    // search for characters which are directly one after another
    let toRemoveIndexes: int[] = [];
    invalidLexems.forEach((lexem, index) => {
      if (
        invalidLexems.length > index + 1 &&
        lexem[1] + 1 === invalidLexems[index + 1][1]
      )
        toRemoveIndexes.push(index + 1);
    });

    // multiple toRemoveIndexes one after another lmao
    for (let i = invalidLexems.length - 1; i >= 0; --i)
      if (toRemoveIndexes.includes(i))
        invalidLexems[toRemoveIndexes[toRemoveIndexes.indexOf(i)] - 1][0] +=
          invalidLexems[toRemoveIndexes[toRemoveIndexes.indexOf(i)]][0];

    invalidLexems = invalidLexems.filter(
      (_, index) => !toRemoveIndexes.includes(index)
    );
    // #endregion

    if (invalidLexems.length !== 0) {
      // invalid characters are in the source code!

      // an index which is INSIDE the line
      const lineIndexes: int[] =
        // #region
        [...code.matchAll(/\n/g)].map((a) => a.index ?? -1);

      // check if the last line is already included!
      const lastLine: str = code.slice(
        lineIndexes[lineIndexes.length - 1] + 1,
        code.length
      );
      // ignore trailing empty lines
      if (lastLine.length !== 0 && lastLine.lastIndexOf('\n') === -1)
        lineIndexes.push(code.length - 1); // add last line, because it isnt in it already
      // #endregion

      for (let i = 0; i < lineIndexes.length; ++i) {
        const errorsOnThisLine = invalidLexems.filter(
          (lexem) => getLinePos(lexem[1]) === i + 1
        );

        if (errorsOnThisLine.length !== 0) {
          // log an error message for this line
          const errors: {
            str: str;
            column: int;
          }[] = errorsOnThisLine.map(([substr, index]) => {
            return {
              str: substr,
              column: getColumnPos(index) - 1
            };
          });

          // edit current line to color in all the errors
          function colorBadSymbols(
            line: str,
            val: [column: int, len: int][]
          ): str {
            return '';
          }

          // #region generate msg
          let errorMsg: str = '';
          for (const error of errors)
            errorMsg +=
              ' '.repeat(error.column - errorMsg.length) +
              '^'.repeat(error.str.length);

          const msg: str = `invalid character${
            (errorMsg.match(/\^/g) ?? []).length > 1 ? 's' : ''
          } at line ${i}: `;
          const constOffset: int = '[lexer-error]: '.length;

          // include the offset of the msg itself
          errorMsg = ' '.repeat(msg.length + constOffset) + errorMsg;
          // #endregion

          error(
            msg +
              `${
                getLine(lineIndexes[i]) /* current line */
              }\n${errorMsg.replace(/\^/g, addColor('^'))}`
          );
        }
      }
    }
  }

  function addColor(msg: str, color: int = 32) {
    return '\u001b[' + 31 + 'm' + msg + '\u001b[0m';
  }

  // #region helper functions
  // #region console
  function log(...data: any[]): void {
    console.log(`[lexer]:`, ...data);
  }

  function error(errorMsg: str, ...data: any[]): void {
    console.error(`[lexer-error]: ${errorMsg}`, ...data);
  }
  // #endregion

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

  function eatNumber(): { charCount: int; number: str } {
    let number: str = curChar();

    let gotDot: bool = false;
    let gotE: bool = false;
    let lastCharWasE: bool = false; // for optionall sign after the e

    // look into the future
    while (true) {
      if (lastCharWasE) {
        lastCharWasE = false;
        if (!!nextChars().match(/[+-]/)) {
          number += nextChars();
          advance();
          continue;
        } // else just continue
      }

      if (isDigit(nextChars())) {
        number += nextChars();
        advance();
      } else if (!!nextChars().match(/\./) && !gotDot && !gotE) {
        gotDot = true;
        number += nextChars();
        advance();
      } else if (!!nextChars().match(/e/i) && !gotE) {
        gotE = true;
        lastCharWasE = true;
        number += nextChars();
        advance();
      } else break;
    }

    return { charCount: number.length - 1, number };
  }

  function eatString(): { charCount: int; str: str } {
    let str: str = '';

    while (true) {
      // handle "\n", "\t", \uxxxx and escapes (\)
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
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
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
  lexer.lexer(`
let x = #$ 5 + $ 3;
`)
);
