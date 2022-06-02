import * as l from './lexer';

export namespace compiler {
  export interface ast {}

  export function compiler(lexems: l.lexer.lexem[]): ast {
    return {};
  }
}
