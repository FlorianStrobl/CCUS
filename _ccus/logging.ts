namespace logger {
  // line and columns always starts with index 1

  interface codeInfoRaw {
    index: number;
    length: number;
    message: string;
  }

  interface codeInfoRelativ {
    lineIndex: number;
    column: number;
    length: number;
    message: string;
  }

  export function log(author: string, ...data: any[]): void {
    console.log(`[${author}]: `, ...data);
  }

  export function error(author: string, ...data: []): void {
    console.error(`[${author}-error]: `, ...data);
  }

  export function logInfo(
    code: string,
    codeInfos: codeInfoRaw[] | codeInfoRelativ[]
  ): void {


    function getLines(): string[] {
      return code.split('\n');
    }

    function getLinePos(index: number): number {
      return (code.slice(0, index + 1).match(/\n/g) || []).length + 1;
    }

    function getLineIndex(line: number): number {
      const previousLines: string[] = getLines().slice(0, line - 1); // -1 to not include the line itself
      // +line-1 includes the "\n" between the lines
      return previousLines.join('').length + line - 1;
    }
  }
}
