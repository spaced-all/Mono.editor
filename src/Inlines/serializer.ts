import { Noticable } from "../types/noticable";
import { dom } from "../utils";
import { createElement, createTextNode } from "../utils/contrib";
import { validChildNodes } from "../utils/dom";
import { ABCInline, ABCInlineConstrutor, DefaultInline } from "./abc";
import { IMath } from "./math";
import { extendInline } from "./register";
import {
  BasicFormattedText,
  ExtendInlineComponent,
  InlineElement,
  InlineElementMap,
  Math,
  PlainText,
} from "./types";

export function serializeInlineElement(node: Node | Node[]): InlineElement[] {
  if (!node) {
    return [];
  }
  if (!Array.isArray(node)) {
    node = [node];
  }

  const res = node.map((c) => {
    const tagName = dom.getTagName(c);
    console.log(["serialize", c]);
    let res: InlineElement;
    switch (tagName) {
      case "#text":
        res = { kind: "#text", text: c.textContent } as PlainText;
        break;
      case "b":
      case "i":
      case "code":
      case "s":
      case "em":
        if (dom.isFullTextNode(c as HTMLElement)) {
          res = {
            kind: tagName,
            text: dom.fullText(c),
          };
        } else {
          res = {
            kind: tagName,
            children: serializeInlineElement(dom.validChildNodes(c)),
          };
        }
        if (tagName === "em") {
          res["color"] = (c as HTMLElement).style.color;
          res["backgroundColor"] = (c as HTMLElement).style.backgroundColor;
        }
        break;
      case "label":
        const el = c as HTMLLabelElement;
        const kind = el.getAttribute("data-type");
        if (kind === "math") {
          res = {
            kind: "math",
            value: el.getAttribute("data-value"),
          } as Math;
        }
        break;
      default:
        res = { kind: "#text", text: "not supported" };
    }
    return res;
  }) as InlineElement[];
  return res;
}

export function renderInlineElement<K extends keyof InlineElementMap>(
  item: InlineElementMap[K] | InlineElementMap[K][]
): [Node[], Noticable[]] {
  if (!item) {
    return [[], []];
  }
  if (!Array.isArray(item)) {
    item = [item];
  }

  const noticable: Noticable[] = [];
  const nodes = item.map((val, ind, arr) => {
    let el: Node;
    let subNodes, subNoticables: Noticable[];
    let inode, inoticable;
    switch (val.kind) {
      case "#text":
        return createTextNode(val.text);
      case "b":
      case "i":
      case "code":
      case "s":
      case "del":
      case "em":
        [subNodes, subNoticables] = renderInlineElement(val.children);

        el = createElement(val.kind, {
          textContent: val.text,
          children: subNodes,
        });
        subNoticables.forEach((c) => noticable.push(c));
        if (val.kind === "em") {
          (el as HTMLElement).style.color = val.color;
          (el as HTMLElement).style.backgroundColor = val.backgroundColor;
        }
        return el;

      case "a":
      case "image":
        break;
      case "formular":
      case "math":
        [inode, inoticable] = new IMath({
          initialData: val as any,
        }).lazyRender();
        noticable.push(inoticable);
        return inode;
      case "relation":
      case "todo":
        break;
      default:
        if (val.kind.startsWith("@")) {
          const inlineType = extendInline.get(val.kind);
          const inline = new inlineType({
            initialData: val as ExtendInlineComponent,
            message: { serialize: true },
          });
          [inode, inoticable] = inline.lazyRender();
          noticable.push(inoticable);
          return inode;
        }
        break;
    }
    return createTextNode('Missiong serializer for "' + val.kind + '"');
  });

  return [nodes, noticable];
}
