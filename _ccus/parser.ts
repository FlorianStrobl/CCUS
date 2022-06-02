import * as c from './compiler';

export namespace parser {
  export interface asm {}

  export function parser(ast: c.compiler.ast): asm {
    return {};
  }
}
