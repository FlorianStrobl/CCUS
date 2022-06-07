import { lexer } from './lexer';

export namespace prettier {
  // TODO, work with AST, different rules like dont break new \n, wrap around a limit of columns
  // export function prettify(code: string): string {
  //   let ans: string = '';
  //   const lexems = lexer.lexe(code);
  //   let deep: number = 0;
  //   let lineEmpty: boolean = true;
  //   for (const lexem of lexems) {
  //     if (lexem.content === '{') {
  //       deep++;
  //       ans += ` {\n`;
  //       lineEmpty = true;
  //     } else if (lexem.content === '}') {
  //       deep--;
  //       ans += `\n${'  '.repeat(deep)}}\n`;
  //       lineEmpty = true;
  //     } else if (lexem.content === ';') {
  //       ans += ';\n';
  //       lineEmpty = true;
  //     } else {
  //       if (lineEmpty) ans += '  '.repeat(deep);
  //       lineEmpty = false;
  //       //if (lexem.type === 'symbol') ans = ans.slice(0, ans.length - 1); // remove the last space
  //       ans += lexem.content + (lexem.type === 'symbol' ? ' ' : ' '); //
  //     }
  //   }
  //   return ans;
  // }
}
