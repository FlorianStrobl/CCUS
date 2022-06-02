type int = number;
type str = string;
type char = string;

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

  let currentIndex: number = 0;

  export function lexer(source: string): lexem[] {
    return [];
  }

  function currentChar(code: string): char {
    return '';
  }
}
