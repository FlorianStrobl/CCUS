export const symbols: {
  symbol: string;
  precedence: string;
  associativity: string;
  description: string;
}[] = [
  {
    symbol: '.',
    precedence: '-',
    associativity: '-',
    description: 'seperator/accessor'
  },
  {
    symbol: ',',
    precedence: '-',
    associativity: '-',
    description: 'enumerator' // TODO
  },
  {
    symbol: ';',
    precedence: '-',
    associativity: '-',
    description: 'seperator' // TODO
  },
  {
    symbol: '(',
    precedence: '-',
    associativity: '-',
    description: 'grouping' // TODO
  },
  {
    symbol: ')',
    precedence: '-',
    associativity: '-',
    description: 'grouping' // TODO
  },
  {
    symbol: '{',
    precedence: '-',
    associativity: '-',
    description: 'grouping' // TODO
  },
  {
    symbol: '}',
    precedence: '-',
    associativity: '-',
    description: 'grouping' // TODO
  },
  {
    symbol: '[',
    precedence: '-',
    associativity: '-',
    description: 'grouping' // TODO
  },
  {
    symbol: ']',
    precedence: '-',
    associativity: '-',
    description: 'grouping' // TODO
  },
  {
    symbol: '=',
    precedence: '-',
    associativity: '-',
    description: 'assigment' // TODO
  },
  {
    symbol: '+',
    precedence: '-',
    associativity: '-',
    description: 'math' // TODO
  },
  {
    symbol: '-',
    precedence: '-',
    associativity: '-',
    description: 'math' // TODO
  },
  {
    symbol: '*',
    precedence: '-',
    associativity: '-',
    description: 'math' // TODO
  },
  {
    symbol: '/',
    precedence: '-',
    associativity: '-',
    description: 'math' // TODO
  },
  {
    symbol: '**',
    precedence: '-',
    associativity: '-',
    description: 'math' // TODO
  },
  {
    symbol: '%',
    precedence: '-',
    associativity: '-',
    description: 'math' // TODO
  },
  {
    symbol: '<',
    precedence: '-',
    associativity: '-',
    description: 'bool/math' // TODO
  },
  {
    symbol: '>',
    precedence: '-',
    associativity: '-',
    description: 'bool/math' // TODO
  },
  {
    symbol: '<=',
    precedence: '-',
    associativity: '-',
    description: 'bool/math' // TODO
  },
  {
    symbol: '>=',
    precedence: '-',
    associativity: '-',
    description: 'bool/math' // TODO
  },
  {
    symbol: '==',
    precedence: '-',
    associativity: '-',
    description: 'bool' // TODO
  },
  {
    symbol: '!=',
    precedence: '-',
    associativity: '-',
    description: 'bool' // TODO
  },
  {
    symbol: '!',
    precedence: '-',
    associativity: '-',
    description: 'bool' // TODO
  },
  {
    symbol: '&&',
    precedence: '-',
    associativity: '-',
    description: 'bool' // TODO
  },
  {
    symbol: '||',
    precedence: '-',
    associativity: '-',
    description: 'bool' // TODO
  },
  {
    symbol: '~',
    precedence: '-',
    associativity: '-',
    description: 'binary' // TODO
  },
  {
    symbol: '&',
    precedence: '-',
    associativity: '-',
    description: 'binary' // TODO
  },
  {
    symbol: '|',
    precedence: '-',
    associativity: '-',
    description: 'binary' // TODO
  },
  {
    symbol: '^',
    precedence: '-',
    associativity: '-',
    description: 'binary' // TODO
  },
  {
    symbol: '?',
    precedence: '-',
    associativity: '-',
    description: 'tenary' // TODO
  },
  {
    symbol: ':',
    precedence: '-',
    associativity: '-',
    description: 'tenary, type annotation' // TODO
  },
  {
    symbol: '...',
    precedence: '-',
    associativity: '-',
    description: 'multiple args, or array/enumerator' // TODO
  },
  {
    symbol: '++',
    precedence: '-',
    associativity: '-',
    description: 'increment operator' // TODO
  },
  {
    symbol: '--',
    precedence: '-',
    associativity: '-',
    description: 'decrement operator' // TODO
  },
  {
    symbol: '+=',
    precedence: '-',
    associativity: '-',
    description: '' // TODO
  },
  {
    symbol: '-=',
    precedence: '-',
    associativity: '-',
    description: '' // TODO
  },
  {
    symbol: '*=',
    precedence: '-',
    associativity: '-',
    description: '' // TODO
  },
  {
    symbol: '/=',
    precedence: '-',
    associativity: '-',
    description: '' // TODO
  },
  {
    symbol: '**=',
    precedence: '-',
    associativity: '-',
    description: '' // TODO
  },
  {
    symbol: '%=',
    precedence: '-',
    associativity: '-',
    description: '' // TODO
  }
  /**
   * _ for numbers and identifier/keywords
   * \ for string escape
   */
];

export const keywords: string[] = [
  'bit', // type
  'namespace', // namespaces
  'pub', // public for namespaces
  'priv', // private for namespaces
  'mut', // mutable data
  'const', // constant data (?)
  'let', // variable declaration
  'func', // function declaration
  'return', // what a function evaluates to
  'if', // when true, do that
  'else', // when if false, do that
  'loop', // repeat this, while bit | for int | for element
  'match' // "switch" with expression matching
];
