import * as p from './parser';

export namespace compiler {
  export interface asm {}

  export function compiler(ast: p.parser.ast): asm {
    return {};
  }
}
