import * as c from './compiler';
import * as l from './lexer';

export namespace parser {
  export interface ast {}

  export function parse(lexems: l.lexer.lexem[]): ast {
    console.log(lexems);
    return {};
  }
}

console.log(parser.parse(l.lexer.lexe(`let x: i8 = -5;`)));
