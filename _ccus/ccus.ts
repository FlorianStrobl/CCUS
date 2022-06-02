import * as fr from '../ccus/Compiler/fileReader';
import { lexer } from './lexer';
import { compiler } from './compiler';
import { parser } from './parser';

namespace ccus {
  interface error {}
}

const src: string = fr.getCode();
console.log('src: ', src);

const lexems = lexer.lexer(src);
console.log('lexems: ', lexems);

const ast = compiler.compiler(lexems);
console.log('ast: ', ast);

const asm = parser.parser(ast);
console.log('asm: ', asm);
