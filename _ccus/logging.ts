export namespace logger {
  // line and columns always starts with index 1

  interface logInfoInfos {
    fileName: string;
    author: string;
  }

  interface codeInfoRaw {
    index: number;
    length: number;
    markColor: number;
    messageColor: number;
    message: string;
    infoCode: string;
    infoType: 'warning' | 'error';
    infoDescription: string;
  }

  interface codeInfoRelativ {
    line: number;
    column: number;
    length: number;
    markColor: number;
    messageColor: number;
    message: string;
    infoCode: string;
    infoType: 'warning' | 'error';
    infoDescription: string;
  }

  export function log(author: string, ...data: any[]): void {
    console.log(`[${author}]: `, ...data);
  }

  export function error(author: string, ...data: any[]): void {
    console.error(`[${author}-error]: `, ...data);
  }

  export function logInfo(
    infos: logInfoInfos,
    code: string,
    codeInfos: // | (codeInfoRaw | codeInfoRaw[])[] // TODO, multiple errors within a line, sort by column, ...
    // | (codeInfoRelativ | codeInfoRelativ[])[]| (codeInfoRaw | codeInfoRaw[])[]
    codeInfoRelativ[] | codeInfoRaw[],
    withColor: boolean = true
  ): void {
    for (let codeInfo of codeInfos) {
      let line: number = -1;
      let column: number = -1;
      let len: number = -1; // the length of the wrong part

      // @ts-expect-error
      if (codeInfo.line !== undefined) {
        codeInfo = codeInfo as codeInfoRelativ;
        line = codeInfo.line;
        column = codeInfo.column;
      } else {
        codeInfo = codeInfo as codeInfoRaw;
        line = getLinePos(codeInfo.index);
        column = getColumnPos(codeInfo.index);
      }

      const curLine: string = getLines()[line];
      // calculate the length of the invalid part, to avoid going over the line
      if (curLine.length >= column + codeInfo.length) len = codeInfo.length;
      // the -1 for the last \n to not get marked with ^
      else
        len = curLine.length - column - 1 > 0 ? curLine.length - column - 1 : 1;

      const previousCode: string = curLine.slice(0, column);
      let errorCode: string = curLine.slice(column, column + len);
      let followingCode: string = curLine.slice(column + len, curLine.length);

      // unwanted special cases with \n
      if (errorCode === '\n') errorCode = ''; // it was the last character of the current line
      if (followingCode[followingCode.length - 1] === '\n')
        followingCode = followingCode.slice(0, followingCode.length - 1);

      const msg: string = `${previousCode}${addColor(
        errorCode,
        codeInfo.markColor,
        withColor
      )}${followingCode}`;

      const codeSpace: string = addColor(
        `${' '.repeat(line.toString().length + 1)}| `,
        36,
        withColor
      );

      const what: string = `${addColor(
        codeInfo.infoType + '[' + codeInfo.infoCode + ']',
        codeInfo.infoType === 'error' ? 31 : 90,
        withColor
      )}: ${addColor(codeInfo.infoDescription, 33, withColor)}`;
      const where: string = `${addColor(' -->', 34, withColor)} ${addColor(
        infos.fileName + ':' + line.toString() + ':' + column.toString(),
        90,
        withColor
      )} :`;
      const loggedMsg: string = `${codeSpace}\n${addColor(
        `${line} | `,
        36,
        withColor
      )}${msg}\n${
        codeSpace +
        ' '.repeat(column) +
        addColor('^'.repeat(len), codeInfo.markColor, withColor) +
        ' ' +
        codeInfo.message
          .replace('{arg}', errorCode)
          .split('\n')
          .join('\n' + codeSpace)
      }\n${codeSpace}`;

      //addColor(infos.author)
      console.log(what + '\n' + where + '\n' + loggedMsg + '\n\n');
    }

    function getLines(): string[] {
      return (
        code
          .split('\n')
          // readd the \n, just not for the last one
          .map((v, i, a) => (a.length - 1 === i ? v : v + '\n'))
      );
    }

    // 0 to n
    function getLinePos(index: number): number {
      return (code.slice(0, index).match(/\n/g) || []).length;
    }

    // 0 to n
    function getColumnPos(index: number): number {
      // offset - charCountUntilLastLine
      const i: number = code.slice(0, index).lastIndexOf('\n');
      return index - (i === -1 ? 0 : i + 1);
      // (lastIndexOf===-1) is ok,
      // as it is (- (-1)) => (index + 1); and this is occuring then (index===0)
    }

    function getLineIndex(line: number): number {
      const previousLines: string[] = getLines().slice(0, line - 1); // -1 to not include the line itself
      // +line-1 includes the "\n" between the lines
      return previousLines.join('').length + line - 1;
    }
  }

  /**
   * text color:
   *  red: 31
   *  green: 32
   *  blue: 34
   *  purple: 35
   *
   * background color:
   *  red: 41
   *  green: 42
   *  blue: 44
   *  purple: 45
   */
  export function addColor(
    msg: string,
    color: number = 32,
    active: boolean = true
  ) {
    if (!active) return msg;
    return '\u001b[' + color + 'm' + msg + '\u001b[0m';
  }

  // #region TODO
  // TODO wrong numeric literals!
  const defaultErrorMsg = [
    ['`', `did you mean "${addColor('"')}" instead of "${addColor('`', 31)}"?`],
    ["'", `did you mean "${addColor('"')}" instead of "${addColor("'", 31)}"?`],
    ['ß', `did you mean "${addColor('ss')}" instead of "${addColor('ß', 31)}"?`]
  ];

  export function printErrors(
    code: string,
    invalidLexems: [char: string, index: number][]
  ): void {
    if (invalidLexems.length === 0) return;

    // TODO color in the current line with the errors
    // TODO help msgs

    /**
     * get errors from each line, generate a ^^ message underling all of the mistakes
     * make it dynamic such that the error msg can be adjusted fastly
     */

    // #region merge following characters, TODO not really needed...
    // // search for characters which are directly one after another
    // let toRemoveIndexes: number[] = [];
    // invalidLexems.forEach((lexem, index) => {
    //   if (
    //     invalidLexems.length > index + 1 &&
    //     lexem[1] + 1 === invalidLexems[index + 1][1]
    //   )
    //     toRemoveIndexes.push(index + 1);
    // });

    // // multiple toRemoveIndexes one after another lmao
    // for (let i = invalidLexems.length - 1; i >= 0; --i)
    //   if (toRemoveIndexes.includes(i))
    //     invalidLexems[toRemoveIndexes[toRemoveIndexes.indexOf(i)] - 1][0] +=
    //       invalidLexems[toRemoveIndexes[toRemoveIndexes.indexOf(i)]][0];

    // invalidLexems = invalidLexems.filter(
    //   (_, index) => !toRemoveIndexes.includes(index)
    // );
    // #endregion

    if (invalidLexems.length === 0) return;

    // invalid characters are in the source code!

    // an index which is INSIDE the line
    const lineIndexes: number[] =
      // #region
      [...code.matchAll(/\n/g)].map((a) => a.index ?? -1);

    // check if the last line is already included!
    const lastLine: string = code.slice(
      lineIndexes[lineIndexes.length - 1] + 1,
      code.length
    );
    // ignore trailing empty lines
    if (lastLine.length !== 0 && lastLine.lastIndexOf('\n') === -1)
      lineIndexes.push(code.length - 1); // add last line, because it isnt in it already
    // #endregion

    for (let i = 0; i < lineIndexes.length; ++i) {
      const errorsOnThisLine = invalidLexems.filter(
        (lexem) => getLinePos(code, lexem[1]) === i + 1
      );

      if (errorsOnThisLine.length === 0) continue; // skip to next line

      // log an error message for this line
      const errors: {
        str: string;
        column: number;
      }[] = errorsOnThisLine.map(([substr, index]) => {
        return {
          str: substr,
          column: getColumnPos(code, index) - 1
        };
      });

      // TODO edit current line to color in all the errors

      const ans = generateErrorMsg(errors, i);

      error(
        'lexer',
        ans.msg +
          `${
            getLine(code, lineIndexes[i])
            // .split('')
            // .map((e, index) => {
            //   let lineOffset: number = 16; // TODO
            //   return invalidLexems
            //     .map((a) => a[1])
            //     .includes(index + lineOffset)
            //     ? log.addColor(e, 31)
            //     : e;
            // })
            // .join('') /* current line */
          }\n${ans.errorMsg.replace(/\^/g, addColor('^', 31))}${ans.helpMsg}`
      );
    }
  }

  // TODO! color, multiple lines, ...
  export function generateErrorMsg(
    errors: {
      str: string;
      column: number;
    }[],
    i: number
  ): { errorMsg: string; helpMsg: string; msg: string } {
    let errorMsg: string = '';
    for (const error of errors)
      errorMsg +=
        ' '.repeat(error.column - errorMsg.length) +
        '^'.repeat(error.str.length);

    const msg: string = `invalid character${
      (errorMsg.match(/\^/g) ?? []).length > 1 ? 's' : ''
    } at line ${i + 1}: `;
    const constOffset: number = '[lexer-error]: '.length;

    // include the offset of the msg itself
    errorMsg = ' '.repeat(msg.length + constOffset) + errorMsg;

    // give help if possible
    let helpMsg: string = '';
    for (const error of errors) {
      const index: number = defaultErrorMsg.map((e) => e[0]).indexOf(error.str);
      if (index !== -1) {
        helpMsg += '\n' + defaultErrorMsg[index][1];
      }
    }
    return { errorMsg, helpMsg, msg };
  }

  function getColumnPos(code: string, index: number): number {
    // offset - charCountUntilLastLine
    return index - code.slice(0, index + 1).lastIndexOf('\n');
    // (lastIndexOf===-1) is ok,
    // as it is (- (-1)) => (index + 1); and this is occuring then (index===0)
  }

  // get the line in which this index exists
  function getLine(code: string, index: number): string {
    if (index >= code.length) return '';

    let ans: string = '';
    let inStr: boolean = false;

    for (let i = 0; i < code.length; ++i) {
      if (i === index) inStr = true;

      if (code[i] === '\n')
        if (!inStr) ans = '';
        else break;
      else ans += code[i];
    }

    return ans;
  }

  function getLinePos(code: string, index: number): number {
    return (code.slice(0, index + 1).match(/\n/g) || []).length + 1;
  }
  // #endregion
}
