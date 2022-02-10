//import * as fs from 'fs';
import * as fs from 'fs';

export function getCode(fileName: string): string {
  return fs.readFile(fileName);
}

console.log(getCode('ccus-code'));
