// LEXER
// creates a list of tokens
const source = '(1 + 2) * 3 + 4 * 5 * (6 * 7)';

function lex() {
  let lexerIndex = 0;
  const tokens = [];

  while (lexerIndex < source.length) {
    const ch = source[lexerIndex];

    switch (ch) {
      case ' ':
      case '\n':
        lexerIndex++;
        break;
      case '*':
      case '/':
      case '+':
      case '-':
      case '(':
      case ')':
        lexerIndex++;
        tokens.push({ type: 'operator', value: ch });
        break;
      default:
        if (ch >= '0' && ch <= '9') tokens.push(lexNumber());
        else throw new Error('unknown token: ' + ch);
        break;
    }
  }

  return tokens;

  // reads a number
  function lexNumber() {
    let num = '';

    while (lexerIndex < source.length) {
      const c = source[lexerIndex];

      if (c >= '0' && c <= '9') num += c;
      else break;

      lexerIndex++;
    }

    return { type: 'literal', value: parseInt(num) };
  }
}

// PARSER
const tokens = lex();

let index = 0;

function current() {
  return tokens[index];
}

function previous() {
  return tokens[index - 1];
}

function match(...kind) {
  const cur = current();
  if (cur && cur.type === 'operator' && kind.includes(cur.value)) {
    index++;
    return true;
  }

  return false;
}

function parse() {
  let cur = factor();

  while (match('+', '-')) {
    const operator = previous();

    cur = {
      left: cur,
      right: factor(),
      operator
    };
  }

  return cur;
}

function factor() {
  let cur = literal();

  while (match('*', '/')) {
    const operator = previous();

    cur = {
      left: cur,
      right: literal(),
      operator
    };
  }

  return cur;
}

function literal() {
  const cur = current();

  if (cur.type === 'literal') {
    index++;
    return cur;
  } else if (cur.type === 'operator' && cur.value === '(') {
    index++;
    let left = parse();
    index++;
    return {
      left,
      operator: { type: 'operator', value: '(' }
    };
  }
}

console.log(parse());
