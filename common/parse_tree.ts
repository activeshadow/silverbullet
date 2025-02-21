import type { ParseTree } from "$sb/lib/tree.ts";
import type { Language, SyntaxNode } from "./deps.ts";

export function lezerToParseTree(
  text: string,
  n: SyntaxNode,
  offset = 0,
): ParseTree {
  let children: ParseTree[] = [];
  let nodeText: string | undefined;
  let child = n.firstChild;
  while (child) {
    children.push(lezerToParseTree(text, child));
    child = child.nextSibling;
  }

  if (children.length === 0) {
    children = [
      {
        from: n.from + offset,
        to: n.to + offset,
        text: text.substring(n.from, n.to),
      },
    ];
  } else {
    const newChildren: ParseTree[] = [];
    let index = n.from;
    for (const child of children) {
      const s = text.substring(index, child.from);
      if (s) {
        newChildren.push({
          from: index + offset,
          to: child.from! + offset,
          text: s,
        });
      }
      newChildren.push(child);
      index = child.to!;
    }
    const s = text.substring(index, n.to);
    if (s) {
      newChildren.push({ from: index + offset, to: n.to + offset, text: s });
    }
    children = newChildren;
  }

  const result: ParseTree = {
    type: n.name,
    from: n.from + offset,
    to: n.to + offset,
  };
  if (children.length > 0) {
    result.children = children;
  }
  if (nodeText) {
    result.text = nodeText;
  }
  return result;
}

export function parse(language: Language, text: string): ParseTree {
  const tree = lezerToParseTree(text, language.parser.parse(text).topNode);
  // replaceNodesMatching(tree, (n): MarkdownTree | undefined | null => {
  //   if (n.type === "FencedCode") {
  //     let infoN = findNodeMatching(n, (n) => n.type === "CodeInfo");
  //     let language = infoN!.children![0].text;
  //     let textN = findNodeMatching(n, (n) => n.type === "CodeText");
  //     let text = textN!.children![0].text!;
  //
  //     console.log(language, text);
  //     switch (language) {
  //       case "yaml":
  //         let parsed = StreamLanguage.define(yaml).parser.parse(text);
  //         let subTree = treeToAST(text, parsed.topNode, n.from);
  //         // console.log(JSON.stringify(subTree, null, 2));
  //         subTree.type = "yaml";
  //         return subTree;
  //     }
  //   }
  //   return;
  // });
  return tree;
}
