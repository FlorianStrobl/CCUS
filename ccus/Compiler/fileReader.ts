// @ts-nocheck

import * as fs from 'fs';

export function getCode(
  fileName: string = 'E:/Data/Software development/GitHub/_CCUS/in/Project1/ccuscode.ccus'
): string {
  return fs.readFileSync(fileName, 'utf8').replace(/\r/g, '');
}
