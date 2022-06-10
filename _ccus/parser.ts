import * as c from './compiler';
import * as l from './lexer';

export namespace parser {
  const enum tokenType {
    identifier = 'identifier',
    operator = 'operator'
  }

  export interface expression {}

  export interface literalExpression extends expression {}
  export interface binaryExpression extends expression {}
  export interface tenaryExpression extends expression {}
  export interface letExpression extends expression {}
  export interface funcExpression extends expression {}

  export interface node {
    token: string;
    tokenType: tokenType;
    rawPosition: number;
    left: node;
    right: node;
  }

  export function parse(lexems: l.lexer.lexem[]): any {
    let ast = {};

    for (let i = 0; i < lexems.length; ++i) {
      const lexem = lexems[i];

      if (lexem.type === 'keyword' && lexem.content === 'let') {
      }
    }
    /**
     * Parsing rules:
     * namespace ID { EXP }
     * (pub)? let (mut)? ID (= EXP)?;
     * (pub)? func ID\((ID: TYPE,)\) EXP
     *
     */

    return {};
  }
}

console.log(parser.parse(l.lexer.lexe(`let x: i8 = -5;`)));
