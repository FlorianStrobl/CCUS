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
    symbol = 'symbol', // reserved non-alphanumeric identifiers: ["+", "-", "()", ...]
    literal = 'literal', // any of these types: [true, 0, 0.0, 'a', "hello world"]
    identifier = 'id' // alphanumeric words like "myFunction", "myVariable"
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
    '+'
  ];

  const keywords: str[] = ['bit', 'func', 'for', 'return'];

  let currentIndex: int = 0;
  let currentLineCount: int = 1; // TODO, lower scope?
  let code: str = '';
  // #endregion

  export function lexer(source: str): lexem[] {
    const time: int = Date.now();

    code = source;
    const lexems: lexem[] = [];
    let invalidLexems: [char: char, index: int][] = [];

    for (let i = 0; i < source.length; ++i) {
      if (currentIndex !== i)
        console.error(
          `[lexer] internal error: currentIndex (${currentIndex}) != i (${i})`
        );

      if (isWhitespace(curChar())) {
        // do nothing
        if (curChar() === '\n') currentLineCount++; // increase line count
      } else if (
        curChar() === '/' &&
        (nextChars() === '/' || nextChars() === '*')
      ) {
        const startingIndex: int = currentIndex;
        const startingLineCount: int = currentLineCount;

        const ans = eatComment(nextChars() === '/');

        i += ans.charCount;

        lexems.push({
          content: ans.comment,
          type: tokenType.comment,
          index: startingIndex,
          line: startingLineCount,
          column: getColumne(startingIndex)
        });
      } else if (isSymbol(curChar())) {
        // could be a symbol with multipe characters:
        if (isSymbol(curChar() + nextChars())) {
          lexems.push({
            content: curChar() + nextChars(),
            type: tokenType.symbol,
            index: currentIndex,
            line: currentLineCount,
            column: getColumne()
          });

          // because next character already consumed
          advance();
          i++;
        } else {
          lexems.push({
            content: curChar(),
            type: tokenType.symbol,
            index: currentIndex,
            line: currentLineCount,
            column: getColumne()
          });
        }
      } else if (isAlpha(curChar())) {
        // is identifier or keyword

        const startingIndex: int = currentIndex;
        const startingLineCount: int = currentLineCount;

        const ans = eatIdentifier();

        i += ans.charCount;

        lexems.push({
          content: ans.identifier,
          type: keywords.includes(ans.identifier)
            ? tokenType.keyword
            : tokenType.identifier,
          index: startingIndex,
          line: startingLineCount,
          column: getColumne(startingIndex)
        });
      } else {
        //console.error(
        //  `[lexer] unresolved character at line ${currentLineCount} columne ${getColumne()}: "${curChar()}"`
        //);
        invalidLexems.push([curChar(), currentIndex]);
      }

      advance(); // increase the currentIndex
    }

    console.log(`[lexer] finished lexing in ${Date.now() - time} ms`);

    // #region invalid lexems
    // search for characters which are directly one after another
    let toRemoveIndexes: int[] = [];
    for (let i = 0; i < invalidLexems.length; ++i) {
      let index = invalidLexems[i][1];
      if (invalidLexems.length > i + 1 && index + 1 === invalidLexems[i + 1][1])
        toRemoveIndexes.push(index + 1);
    }

    // TODO, multiple toRemoveIndexes one after another lmao
    console.log(toRemoveIndexes);
    for (let i = 0; i < toRemoveIndexes.length; ++i)
      for (let y = 0; y < invalidLexems.length; ++y)
        if (invalidLexems[y][1] === toRemoveIndexes[i])
          invalidLexems[y - 1][0] += invalidLexems[y][0];

    invalidLexems = invalidLexems.filter((lexem) =>
      toRemoveIndexes.includes(lexem[1])
    );

    console.log(invalidLexems);

    if (invalidLexems.length !== 0)
      console.error(
        `[lexer] lexer found invalid tokens: ${invalidLexems.map(
          ([char, index]) =>
            `\ncharacter at position ${index} is invalid: ${char}`
        )}`
      );
    // #endregion

    return lexems;
  }

  // #region helper functions
  function curChar(): char {
    return code[currentIndex];
  }

  function nextChars(count: int = 1): str {
    return code.slice(currentIndex + 1, currentIndex + 1 + count);
  }

  function advance(): void {
    currentIndex++;
  }

  function eatComment(singleLineComment: bool): {
    charCount: int;
    comment: str;
  } {
    let charCount: int = 0;
    let comment: str = '';

    while (true) {
      if (singleLineComment) {
        if (curChar() === '\n') {
          currentLineCount++;
          break;
        } else {
          comment += curChar();
          advance();
          charCount++;
        }
      } else {
        if (curChar() === '*' && nextChars() === '/') {
          comment += '*/'; // do this, as it isnt done anymore...
          advance(); // advance, because of "*"
          charCount++;
          break;
        } else {
          if (curChar() === '\n') currentLineCount++;
          comment += curChar();
          advance();
          charCount++;
        }
      }
    }

    return { charCount, comment };
  }

  function eatIdentifier(): {
    charCount: int;
    identifier: str;
  } {
    let charCount: int = 0;
    let identifier: str = '';

    while (true) {
      if (!isAlphaNumeric(curChar())) break;
      charCount++;
      identifier += curChar();
      advance();
    }

    return { charCount, identifier };
  }

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

  function isNumeric(char: char): bool {
    return !!char.match(/^[0-9eE+-.]$/);
  }

  function startLikeSymbol(char: char): bool {
    // only checks for the first character of every symbol
    return symbols.map((str) => str[0]).includes(char);
  }

  function isSymbol(str: str): bool {
    return symbols.includes(str);
  }

  function getColumne(index: int = currentIndex): int {
    // offset - charCountUntilLastLine
    return index - code.slice(0, index + 1).lastIndexOf('\n');
    // (lastIndexOf===-1) is ok,
    // as it is (- (-1)) => (index + 1); and this is occuring then (index===0)
  }
  // #endregion
}

console.log(
  lexer.lexer(`+ // cm
func(x) return lama
/*b*///
===~!~/**/
c #// line 9
$$`)
);
