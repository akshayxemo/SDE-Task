class TreeNode {
  constructor(value) {
    this.value = value;
    this.children = [];
  }

  addChild(childNode) {
    this.children.push(childNode);
  }
}

const rootNode = new TreeNode("A");
const nodeB = new TreeNode("B");
const nodeC = new TreeNode("C");
const nodeD = new TreeNode("D");
const nodeE = new TreeNode("E");
const nodeF = new TreeNode("F");
const nodeG = new TreeNode("G");
const nodeH = new TreeNode("H");
const nodeI = new TreeNode("I");
const nodeJ = new TreeNode("J");
const nodeK = new TreeNode("K");
const nodeL = new TreeNode("L");

rootNode.addChild(nodeB);
rootNode.addChild(nodeC);
rootNode.addChild(nodeD);
rootNode.addChild(nodeE);

nodeB.addChild(nodeF);
nodeB.addChild(nodeG);

nodeD.addChild(nodeH);
nodeD.addChild(nodeI);
nodeD.addChild(nodeJ);

nodeE.addChild(nodeK);

nodeG.addChild(nodeL);

function inorderTraversal(node) {
  if (node == null) return;

  let totalChildren = node.children.length;

  // Traverse all the children except the last children if totalChildren is grater than 1
  for (let i = 0; i < totalChildren - 1; i++) {
    inorderTraversal(node.children[i]);
  }

  // if there is only single child then totalChildren = 1 so by the loops condition (totalChildren - 1) = 0
  // and (0 < 0) is not valid condition so loop will not work and the child will not traverse first
  // So then we keep a check on this.
  if (totalChildren == 1) {
    // Traverse only child
    inorderTraversal(node.children[totalChildren - 1]);
    // Then Print the current node's data
    process.stdout.write("" + node.value + " ");
    return;
  } else {
    // First Print the current node's data
    process.stdout.write("" + node.value + " ");
    // Traverse Last child
    inorderTraversal(node.children[totalChildren - 1]);
    return;
  }
}

inorderTraversal(rootNode);
