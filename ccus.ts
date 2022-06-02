import * as fr from './ccus/Compiler/fileReader';

namespace ccus {
  interface error {}

  interface lexem {}

  interface ast {}

  interface asm {}

  export namespace lexer {
    export function lexer(source: string): lexem[] {
      return [];
    }
  }

  export namespace compiler {
    export function compiler(lexems: lexem[]): ast {
      return {};
    }
  }

  export namespace parser {
    export function parser(ast: ast): asm {
      return {};
    }
  }

  export namespace optimizing {
    // asm, or ast?
    export function optimizing() {}
  }

  export namespace binary {
    export function binary(asm: asm): boolean[] {
      return [];
    }
  }

  export namespace interpreter {
    export function run(instructions: asm): never {
      return 0 as never;
    }
  }
}

const src: string = fr.getCode();
console.log('src: ', src);

const lexems = ccus.lexer.lexer(src);
console.log('lexems: ', lexems);

const ast = ccus.compiler.compiler(lexems);
console.log('ast: ', ast);

const asm = ccus.parser.parser(ast);
console.log('asm: ', asm);
