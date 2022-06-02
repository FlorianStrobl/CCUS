type int = number;
type str = string;
type char = string;
type bool = boolean;

export namespace lexer {
  // a "word"/token in the source code
  export interface lexem {
    content: str; // raw value
    type: tokenType; // keyword, literal, ...
    index: int; // raw index in the string
    line: int; // how many \n are before the content
    column: int; // position in the line
  }

  export const enum tokenType {
    whitespaces = 0, // any of: ["\n", " ", "\t"]
    comment = 1, // "// singleline comment" or "/*multiline comment*/" (are considered whitespace)
    keyword = 2, // reserved identifiers: ["func", "bit", ...]
    symbol = 3, // reserved non-alphanumeric identifiers: ["+", "-", "()", ...]
    literals = 4, // any of these types: [true, 0, 0.0, 'a', "hello world"]
    identifier = 5 // alphanumeric words like "myFunction", "myVariable"
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

  let currentIndex: int = 0;
  let currentLineIndex: int = 1; // TODO, lower scope?
  let code: str = '';

  export function lexer(source: str): lexem[] {
    code = source;
    const lexems: lexem[] = [];
    let error: bool = false;

    for (let i = 0; i < source.length; ++i) {
      console.log(currentIndex, source.length);
      if (isWhitespace(curChar())) {
        console.log('whitespace: skipp');
        // do nothing
        if (curChar() === '\n') currentLineIndex++; // increase line count
      } else if (isSymbol(curChar())) {
        console.log('symbol like, check if multiple chars');
        // could be a symbol with multipe characters:
        if (isSymbol(curChar() + nextChars())) {
          console.log('it is two char symbol: ', curChar() + nextChars());

          // two character symbol
          lexems.push({
            content: curChar() + nextChars(),
            type: tokenType.symbol,
            index: currentIndex,
            line: currentLineIndex,
            column: NaN
          });

          // because next character already consumed
          advance();
          i++;
        } else {
          console.log('it is single char symbol: ', curChar());

          // single character symbol
          lexems.push({
            content: curChar(),
            type: tokenType.symbol,
            index: currentIndex,
            line: currentLineIndex,
            column: NaN
          });
        }
      } else {
        error = true;
        console.error(
          `[lexer] unresolved character at line ${currentLineIndex}: "${curChar()}"`
        );
      }

      advance(); // increase the currentIndex
    }

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

  function isWhitespace(char: char): bool {
    return !!char.match(/^(?: |\t|\n)$/);
  }

  function isAlpha(char: char): bool {
    return !!char.match(/^[a-zA-Z_]$/);
  }

  function isAlpanumeric(char: char): bool {
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
  // #endregion
}

console.log(
  lexer.lexer(`a
+,
==
=
=b
===
c
`)
);
