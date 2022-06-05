import * as fr from '../ccus/Compiler/fileReader';
import { lexer } from './lexer';
import { compiler } from './compiler';
import { parser } from './parser';

const src: string = fr.getCode('E:/Data/Downloads/duktape.c');
//console.log('src: ', src);

const lexems = lexer.lexer(src);
//console.log(lexems);
//console.log('lexems: ', lexems);

//const ast = compiler.compiler(lexems);
//console.log('ast: ', ast);

//const asm = parser.parser(ast);
//console.log('asm: ', asm);
