// CCUS 1.0.0

type bool = boolean;
type num = number;
type str = string;
type t = any;

type asm = str;

interface token {
  content: str; // raw value
  type: tokenType; // keyword, literal, ...
  index: num; // raw index in the string
  line: num; // how many \n are there before
  column: num; // in the line
}

enum tokenType {
  whitespaces = 0, // \n,  , \t
  comment = 1, // //comment
  keyword = 2, // func, num
  symbol = 3, // +, -, ()
  literal = 4, // 0, true, "hello"
  identifier = 5 // myFunction, myVariable
}

class CCUS {
  constructor() {}

  /**
   *
   */
  public static CCUStoASM(sourceCode: str): {
    originalSourceCode: str;
    tokensOfSourceCode: token[];
    preprocessedSourceCode: token[];
    codeLogicTree: t;
    asmInstructions: str[];
  } {
    const originalSourceCode: string = sourceCode;
    const tokens: token[] = this.getTokens(originalSourceCode);
    const preprocessedCode: token[] = this.preprocess(tokens);
    const logicTree: any = this.logicAnalyser(preprocessedCode);
    const optimisedTree: any = this.optimiseTree(logicTree);

    return {
      originalSourceCode: originalSourceCode,
      tokensOfSourceCode: tokens,
      preprocessedSourceCode: preprocessedCode,
      codeLogicTree: optimisedTree,
      asmInstructions: []
    };
  }

  /**
   *
   */
  public static ASMinterpreter(asmInstructions: str[]): void {}

  public static getTokens(sourceCode: str): token[] {
    let code: str = sourceCode;

    // get all the comments and replace them with whitespaces (space)
    // for correct indexes later
    const commentRegex: RegExp = /(\/\/.*)|((\/\*)(?:[\s\S]*?)(?:\*\/))/g;
    code = code.replace(
      /(?:\/\/.*)|(?:(\/\*)(?:[\s\S]*?)(?:\*\/))/g,
      (match, offset, string) => {
        console.log('token: ', match, offset);
        return '';
      }
    );
    //console.log(code);

    // get all the literals and replace them with whitespaces

    // get all the keywords and replace them with whitespaces

    // get all the identifiers and replace them with whitespaces

    // get all the symbols and replace them with whitespaces

    return [];
  }

  private static preprocess(tokens: token[]): token[] {
    return [];
  }

  private static logicAnalyser(tokens: token[]): t {}

  private static optimiseTree(logicTree: t): t {}
}

const sourceCode: str = `
// f(x) = 2x
func f(num x) {
  ret 2 * x;
}
`;

//const resolvedCode = CCUS.CCUStoASM(sourceCode);
//console.log(resolvedCode);
//CCUS.ASMinterpreter(resolvedCode.asmInstructions);

const testCode: str = `
  // valid CCS file lol
  def aDef "myVal" // every "aDef" should be replaced with "myVal"
  use "file1" // insert the "file1" file at this position
  def PI 314

 /* / * kfldfl
 *
 *
 f
 / ***/

  // just some empty line
     PI
  otherDef
  // just some spaces to potentially throw of the preCompiler
  func Main () {// just a normal func which has no return type btw
    // this is a comment and an invalid def is here def aDeff 54
    def otherDef 4 // another def in the middle of the file, which is still a global thing
    if (MyFunc(5) == 5) { // if statement with function and == use
      out("fire 1 dash 1"); // output a string
    } else { // else statement
        out  (  "fire 1 dash 2"   )    ;
    } use "file 2" // use statment in the middle of the file
  aDef

    str aStr = " Hello\\" world ";

    num myNum = -5.3E+5;

  // same as the last if just where the else should get called
    if (MyFunc(3) == 7) {
      Log("fire 2 dash 1");
    } else {otherDef
      Log("fire 2 dash 2");
    }
  otherDef

  // just a normal for loop
    for (num x = 0; x < 5; x++) {
     otherDef Log(x);
    }

     num   x    =5    ;
    while (x < 10) {
      out(x);
      x = x + 1;
    }

    out(h);
  }

  func num MyFunc (num i) {
    const num x = 5;
    out(x);

    return i;

    func NoArgsNoCode () {

    }
  }

  // valid comment? // still?
  // this should test if complex spacing is working correctly
  // especially the argument part in the middle
       func     objs    StrangeFormattedfunc     (



          num

  // also a valid comment lol

          arg2  , str lOl // valid comment


           )


    {


                }

  // just declaring a operator as normal
  op num ("++", int x,) {

  }

  op num ("--", , int x) { }

  // benchmark for strange formatting lol
  func
  strs
  haha
  ()
  {}

  otherDeffunc obj ANewFuncWhichShouldNotWork(){}

  / / 0
  /  / 1
  /  / invalid comment because spaces lmao 2
  /
  / 3
  // all of them are not comments 4
  `;

CCUS.getTokens(testCode);
