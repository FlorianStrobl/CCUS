import * as c from './compiler';
import * as l from './lexer';

export namespace parser {
  // #region types
  const enum tokenType {
    identifier = 'identifier',
    operator = 'operator'
  }

  enum varAttributes {
    mutable = 'mut',
    public = 'pub',
    private = 'priv',
    constant = 'const'
  }

  enum funcAttributes {
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

  /**
 *
;
literal;
validInContextIdentifier;

"Operator must be followed by required stuff!!"

if (EXPRESSION) EXPRESSION else EXPRESSION
loop (EXPRESSION) EXPRESSION

struct/object/array "literal"

macros??
type keyword
 */

  // #region interfaces
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

  export interface typeDeclaration extends statement {
    type: 'typeDeclaration';
  }
  // #endregion

  let _lexems: l.lexer.lexem[];
  let lexemIndex: number;
  // #endregion

  export function parse(lexems: l.lexer.lexem[]): any[] {
    _lexems = lexems.filter(
      (lexem) => lexem.type !== 'comment' && lexem.type !== 'whitespace'
    );
    lexemIndex = 0;
    let ast: (expression | statement)[] = [];

    /**
     * Parsing rules:
     * namespace ID { [EXP] }
     * (pub)? let (mut)? ID (= EXP)?;
     * (pub)? func ID\((ID: TYPE,)\) EXP
     *
     */

    // while lexems exist
    while (getLex() !== null) {
      ast.push(parseSingle() as any);
    }

    return ast;
  }

  // TODO!!
  function parseMulti(): any[] {
    return [];
  }

  function parseSingle(): null | any {
    // TODO, empty statement ig
    //if (getLex().content === '}') return null; // DEBUG ONLY

    if (getLex() === null) return null; // TODO finished

    // #region get a statement
    if (getLex().type === 'keyword' && getLex().content === 'func') {
      next();
      const ast = eatFunc();
      return ast; // TODO
    }
    // #endregion

    // #region get an expression
    if (getLex().type === 'keyword' && getLex().content === 'let') {
      next(); // skip the "let" lexem
      const ast = eatLet();
      if (getLex().type === 'symbol' && getLex().content === ';')
        next(); // eat the `;`
      else throw Error('wrong usage of the `let` keyword! a `;` is missing');

      return ast;
    } else if (
      getLex().type === 'symbol' &&
      (getLex().content === '-' || getLex().content === '+')
    ) {
      // TODO unary expression!
      // TODO wrong, what if -3 + 2, it has to actually recall eatExpression() for this!
      /**
       * HERE
       * do a while-loop with
       * currentLexem and nextLexem() === operator (binary op)
       */
      let ans = eatUnary(getLex());
      return ans; // TODO not return!!
    } else if (
      getLex().type === 'id' ||
      getLex().type === 'numericLiteral' ||
      getLex().type === 'stringLiteral'
    ) {
      let ans = { valueExpression: getLex().content, type: getLex().type };
      next();
      return ans;
    }
    // #endregion

    return null; // TODO, what if nothing matches
  }

  // #region eat
  function eatFunc() {
    let lexem: functionDeclaration = {
      type: 'functionDeclaration',
      funcId: '',
      modifier: [],
      value: [],
      startIndex: -1,
      rawString: ''
    };

    // modifier
    while (
      getLex() !== null &&
      getLex().type === 'keyword' &&
      Object.values(funcAttributes).includes(getLex().content as any)
    ) {
      lexem.modifier.push(getLex().content as any);
      next();
    }

    // TODO error if now not identifier

    if (getLex().type === 'id') {
      lexem.funcId = getLex().content;
      next();
    }

    if (getLex().content !== '(') {
      // ERROR
    } else next();

    // TODO arguments

    if (getLex().content !== ')') {
      // ERROR
    } else next();

    // TODO type

    if (getLex().content !== '{') {
      // ERROR
    } else next();

    // TODO get expressions
    const body: any = [];
    while (getLex().content !== '}') {
      body.push(parseSingle() as any);
    }
    lexem.value = body as any;

    if (getLex().content !== '}') {
      // ERROR
    } else next();

    return lexem;
  }

  function eatUnary(lexem: l.lexer.lexem) {
    return {
      unaryExpression: getLex().content,
      value: getLex(1).content,
      valueType: getLex(1).type,
      valuePos: getLex(1).index
    };
  }

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
      lexem.initializeValue = parseSingle() as any;
    }

    return lexem;
  }
  // #endregion

  // #region helper functions
  function next(): null | l.lexer.lexem {
    lexemIndex++;
    if (lexemIndex === _lexems.length) return null;
    else return getLex();
  }

  function getLex(future: number = 0): l.lexer.lexem {
    if (future + lexemIndex >= _lexems.length) return null as any;
    return _lexems[lexemIndex + future];
  }
  // #endregion
}

console.log(
  l.lexer.lexe(
    `
      //let x = 5;
      //let mut x;
      //let mut x;
      //let x: i32;
      //let x = 5;
      //let mut x: i32 = 5;

      /*func const f() {
        func g() {
          let x = 5;
        }
      }*/

      let x = ++y * 4 + 3 * 2;
      let u = (f = -3 - 2 * (3 + 7));
      `
  ),
  ...parser.parse([])
);
