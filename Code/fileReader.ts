// @ts-nocheck

import * as fs from 'fs';

export function getCode(
  fileName: string = 'E:/Data/Software development/GitHub/CCUS/Code/ccuscode.txt'
): string {
  return fs.readFileSync(fileName, 'utf8');
}
