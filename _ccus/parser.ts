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

  let _lexems: l.lexer.lexem[];
  let lexemNr: number;

  export function parse(lexems: l.lexer.lexem[]): any {
    _lexems = lexems;
    lexemNr = 0;
    let ast: any = [];

    /**
     * Parsing rules:
     * namespace ID { EXP }
     * (pub)? let (mut)? ID (= EXP)?;
     * (pub)? func ID\((ID: TYPE,)\) EXP
     *
     */

    // ast =
    while (getLex() !== null) {
      ast.push(eatExpression() as unknown as never);
    }

    return ast;
  }

  function eatExpression() {
    if (getLex().type === 'keyword' && getLex().content === 'let') {
      next();
      return eatLet();
    } else if (getLex().type === 'keyword' && getLex().content === 'func') {
      next();
      return eatFunc();
    } else if (
      getLex().type === 'symbol' &&
      (getLex().content === '-' || getLex().content === '+') &&
      (getLex(1).type === 'id' || getLex(1).type === 'numericLiteral')
    ) {
      // TODO unary expression!
      let ans = {
        unaryExpression: getLex().content,
        value: getLex(1).content,
        valueType: getLex(1).type,
        valuePos: getLex(1).index
      };
      next();
      next();
      return ans;
    } else if (
      getLex().type === 'id' ||
      getLex().type === 'numericLiteral' ||
      getLex().type === 'stringLiteral'
    ) {
      let ans = { valueExpression: getLex().content, type: getLex().type };
      next();
      return ans;
    }
  }

  function eatFunc() {}

  function eatLet() {
    let lexem = {
      mutable: false,
      name: '',
      pos: -1,
      value: null
    };

    // modifier
    if (getLex().type === 'keyword' && getLex().content === 'mut') {
      lexem['mutable'] = true;
      next();
    }

    // name
    if (getLex().type === 'id') {
      lexem.name = getLex().content;
      lexem.pos = getLex().index;
      next();
    }

    // TODO, typedef

    if (getLex().type === 'symbol' && getLex().content === '=') {
      // its directly initialized
      next();
      lexem.value = eatExpression() as any;
    }

    return lexem;
  }

  function next(): void {
    lexemNr++;
  }

  function getLex(future: number = 0): l.lexer.lexem {
    if (future + lexemNr >= _lexems.length) return null as any;
    return _lexems[lexemNr + future];
  }
}

console.log(parser.parse(l.lexer.lexe(`let x = -5 let mut y = "haha"`)));
