import * as c from './compiler';
import * as l from './lexer';

export namespace parser {
  const enum tokenType {
    identifier = 'identifier',
    operator = 'operator'
  }

  const enum varAttributes {
    mutable = 'mut',
    public = 'pub',
    private = 'priv',
    constant = 'const'
  }

  const enum funcAttributes {
    public = 'pub',
    private = 'priv',
    constant = 'const'
  }

  export interface expression {}
  export interface statement {}

  export interface literalExpression extends expression {}
  export interface binaryExpression extends expression {}
  export interface tenaryExpression extends expression {}
  export interface letExpression extends expression {}
  export interface funcExpression extends expression {}

  // let ([MOD])? ID (: TYPE)? (= EXPRESSION)?;
  export interface variableDeclaration extends statement {
    type: 'variableDeclaration';
    varId: string; // e.g. x
    varType: string;
    modifier: varAttributes[];
    initializeValue: expression; // e.g. 4
    startIndex: number; // e.g. 0 (for error msgs)
    rawString: string; // e.g. let     _a   =  4 ; (for error msgs)
  }

  // namespace ([MOD])? ID { [EXPRESSION] }
  export interface namespaceDeclaration extends statement {
    type: 'namespaceDeclaration';
    nsId: string;
    modifier: varAttributes[];
    value: expression[];
    startIndex: number;
    rawString: string;
  }

  // func [MOD]? ID \((ARG: TYPE),*\) (: TYPE)? { [EXPRESSION] }
  export interface functionDeclaration extends statement {
    type: 'functionDeclaration';
    funcId: string;
    modifier: funcAttributes[];
    value: expression[];
    startIndex: number;
    rawString: string;
  }

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
    let ast: (expression | statement)[] = [];

    /**
     * Parsing rules:
     * namespace ID { EXP }
     * (pub)? let (mut)? ID (= EXP)?;
     * (pub)? func ID\((ID: TYPE,)\) EXP
     *
     */

    // ast =
    while (getLex() !== null) {
      ast.push(parser() as unknown as expression);
    }

    return ast;
  }

  function parser() {
    if (getLex() === null) return null; // TODO finished

    while (getLex().type === 'comment') {
      next();
      if (getLex() === null) return null;
    }

    if (getLex().type === 'keyword' && getLex().content === 'let') {
      next(); // skip the "let" part
      const ast = eatLet();
      if (getLex().type === 'symbol' && getLex().content === ';') {
        next(); // eat the ;
      } else {
        throw Error('this is wrong!!');
      }
      return ast;
    } else if (getLex().type === 'keyword' && getLex().content === 'func') {
      next();
      return eatFunc();
    } else if (
      getLex().type === 'symbol' &&
      (getLex().content === '-' || getLex().content === '+') &&
      (getLex(1).type === 'id' || getLex(1).type === 'numericLiteral')
    ) {
      // TODO unary expression!
      // TODO wrong, what if -3 + 2, it has to actually recall eatExpression() for this!
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

    return null; // TODO, what if nothing matches
  }

  function eatFunc() {}

  function eatLet() {
    // TODO
    let lexem: variableDeclaration = {
      type: 'variableDeclaration',
      varId: '', // e.g. x
      varType: '',
      modifier: [],
      initializeValue: [], // e.g. 4
      startIndex: -1, // e.g. 0 (for error msgs)
      rawString: '' // e.g. let     _a   =  4 ; (for error msgs)
    };

    lexem.startIndex = getLex(-1).index; // the index of the `let` keyword

    // modifier
    while (getLex().type === 'keyword') {
      if (
        getLex().content === 'mut' &&
        !lexem.modifier.includes(varAttributes.mutable)
      ) {
        lexem.modifier.push(varAttributes.mutable);
        next();
      }

      if (
        getLex().content === 'pub' &&
        !lexem.modifier.includes(varAttributes.public)
      ) {
        lexem.modifier.push(varAttributes.public);
        next();
      }

      break; // TODO got keyword but no value!!
    }

    // identifier
    if (getLex().type === 'id') {
      lexem.varId = getLex().content;
      next();
    }

    // TODO, type :...

    if (getLex().type === 'symbol' && getLex().content === '=') {
      // its directly initialized
      next();
      lexem.initializeValue = parser() as any;
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

console.log(
  parser.parse(
    l.lexer.lexe(
      `
      let x;
      let mut x;
      let mut x;
      //let x: i32;
      let x = 5;
      //let mut x: i32 = 5;
      `
    )
  )
);
