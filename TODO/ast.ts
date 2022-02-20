class AST {
  private leftNode: AST | null;
  private rightNode: AST | null;
  public data: { content: string; type: number };

  constructor(leftNode: AST | null = null, rightNode: AST | null = null) {
    this.leftNode = leftNode;
    this.rightNode = rightNode;
  }

  public setLeft(abs: AST): void {
    this.leftNode = abs;
  }

  public setRight(abs: AST): void {
    this.rightNode = abs;
  }

  public getLeft(): AST | null {
    return this.leftNode;
  }

  public getRight(): AST | null {
    return this.rightNode;
  }

  public goWay(way: (true | false)[]): AST | null {
    // base case
    if (way.length === 0) return this;

    // check if next node is null
    if (way[0] === true && this.leftNode === null) return null;
    else if (way[0] === false && this.rightNode === null) return null;

    // for each node
    for (const w of way)
      if (w === true)
        // go one node to the left
        return this.leftNode!.goWay(way.slice(1));
      // go one node to the right
      else return this.rightNode!.goWay(way.slice(1));

    return null;
  }

  public static traverseAllChilds(
    node: AST,
    currentValues: string[] = []
  ): string[] {
    // base case
    if (node === null) return currentValues;

    // add current content
    currentValues.push(node.data.content);

    // add every left node
    currentValues = AST.traverseAllChilds(node.getLeft()!, currentValues);
    // add every right node
    currentValues = AST.traverseAllChilds(node.getRight()!, currentValues);

    return currentValues;
  }
}

// #region data
let t8 = new AST();
t8.data = { content: 'left left left', type: 0 };
let t9 = new AST();
t9.data = { content: 'right left left', type: 0 };
let t10 = new AST();
t10.data = { content: 'left right left', type: 0 };
let t11 = new AST();
t11.data = { content: 'right right left', type: 0 };
let t12 = new AST();
t12.data = { content: 'left left right', type: 0 };
let t13 = new AST();
t13.data = { content: 'right left right', type: 0 };
let t14 = new AST();
t14.data = { content: 'left right right', type: 0 };
let t15 = new AST();
t15.data = { content: 'right right right', type: 0 };

let t4 = new AST(t8, t12);
t4.data = { content: 'left left', type: 0 };
let t5 = new AST(t9, t13);
t5.data = { content: 'right left', type: 0 };
let t6 = new AST(t10, t14);
t6.data = { content: 'left right', type: 0 };
let t7 = new AST(t11, t15);
t7.data = { content: 'right right', type: 0 };

let t2 = new AST(t4, t6);
t2.data = { content: 'left', type: 0 };
let t3 = new AST(t5, t7);
t3.data = { content: 'right', type: 0 };
let tree = new AST(t2, t3);
tree.data = { content: 'start', type: 0 };
// #endregion

console.log(AST.traverseAllChilds(tree));
console.log(tree.goWay([false, true, true]));
