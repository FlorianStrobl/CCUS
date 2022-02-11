import * as fs from 'fs';

export function getCode(
  fileName: string = 'E:/Data/Software development/GitHub/CCUS/Code/ccuscode.ccus'
): string {
  return fs.readFileSync(fileName, 'utf8').replace(/\r/g, '');
}
