import { RelPosition } from "../operator/types";
import { ElementTagName, HTMLElementTagName } from "../types/dom";
import { createElement } from "./contrib";

export interface Condition {
  emptyText?: boolean;
  whiteText?: boolean;
  br?: boolean;
  nullable?: boolean;
}

export function isTextNode(el: Node): boolean {
  return (isTag(el, "#text") && el.textContent.length > 0) || isTag(el, "br");
}

export function isValidTag(el: Node, condition?: Condition) {
  condition = condition || {};

  if (!el && condition.nullable !== false) {
    return true;
  }

  if (el.nodeType === 1) {
    if (isTag(el, "br")) {
      return condition.br !== false;
    }
    if (isTag(el, "data")) {
      return false;
    }
    if (!(el as HTMLElement).classList.contains("bound-hint")) {
      return true;
    }
  }

  if (el.nodeType === 3) {
    if (condition.emptyText !== false) {
      return true;
    }
    if (condition.whiteText !== false) {
      return el.textContent.length > 0;
    }
    return el.textContent.trim() !== "";
  }
  return false;
}

export function nextValidNode(el: Node, condition?: Condition) {
  while (el) {
    el = el.nextSibling as Node;
    if (isValidTag(el, condition)) {
      return el;
    }
  }
  return el;
}

export function firstValidChild(el: Node, condition?: Condition) {
  el = el.firstChild;
  while (el) {
    if (isValidTag(el, condition)) {
      return el;
    }
    el = el.nextSibling as HTMLElement;
  }
  return el;
}

export function lastValidChild(el: Node, condition?: Condition) {
  el = el.lastChild;
  while (el) {
    if (isValidTag(el, condition)) {
      return el;
    }
    el = el.previousSibling as HTMLElement;
  }
  return el;
}

export function previousValidNode(el: Node, condition?: Condition) {
  while (el) {
    el = el.previousSibling as HTMLElement;
    if (isValidTag(el, condition)) {
      return el;
    }
  }
  return el;
}

function neighborValidPosition(
  root: HTMLElement,
  direction: "left" | "right",
  container?: Node,
  offset?: number
): RelPosition | null {
  if (!container) {
    const sel = document.getSelection();
    container = sel.focusNode;
    offset = sel.focusOffset;
  }

  const neighborSibling = (el, condition?: Condition) =>
    direction === "left"
      ? previousValidNode(el, condition)
      : nextValidNode(el, condition);

  const innerBorderChild = (el) =>
    direction === "left" ? lastValidChild(el) : firstValidChild(el);

  var inner;
  var neighbor;

  if (!isTag(container, "#text")) {
    if (isTag(container, "label")) {
      if (direction === "left") {
        // <b>some</b>"/"<label>|</label>
        neighbor = previousValidNode(container);
        if (isTag(neighbor, "#text")) {
          return new RelPosition(neighbor, neighbor.textContent.length, root);
        }
      } else if (direction === "right") {
        // <label>|</label>"/"<b>some</b>
        neighbor = nextValidNode(container);
        if (isTag(neighbor, "#text")) {
          return new RelPosition(neighbor, 0, root);
        }
      }

      offset = indexOfNode(container);
      if (direction === "right") {
        offset++;
      }
      // <label>|</label>\<b>some</b>
      // <b>some</b>\<label>|</label>
      return new RelPosition(container.parentElement, offset, root);
    }
    if (container.childNodes[offset]) {
      // <p>|<br>\</p>
      // <p>\<br>|<br>\</p>
      // <p><br>|<b>\</b></p>
      // <p>\<i>|<b>\</b></i></p>
      // <p><br>|"text"</p>
      if (
        isTag(container.childNodes[offset], "#text") &&
        direction === "right" &&
        container.childNodes[offset].textContent.length > 0
      ) {
        // <p>|"text"</p>
        return new RelPosition(container.childNodes[offset], 1, root);
      }
      container = container.childNodes[offset];
      offset = 0;
    } else {
      // <p><br><b>|</b></p>
      // <p><br><b></b>|</p>
    }
    // container = container.childNodes[offset];
    // offset = 0;
  }

  // in text node
  // <p>"t\e|x\t"</p>
  if (isTag(container, "#text")) {
    if (direction === "left" && offset > 0) {
      offset--;
      return new RelPosition(container, offset, root);
    } else if (direction === "right" && offset < container.textContent.length) {
      offset++;
      return new RelPosition(container, offset, root);
    }
  } else {
    // <p><br><b>|</b>|</p>
    // <p><br><b>|</b>|<br></p>
    // <p><br><b></b>|</p>
    offset = indexOfNode(container);
    if (direction === "right") {
      offset++;
    }
    return new RelPosition(container.parentElement, offset, root);
  }
  // 除了不允许空文本，可允许 text / br / 其他任意tag
  neighbor = neighborSibling(container, { emptyText: false });
  // debugger;
  if (neighbor) {
    if (isTag(neighbor, "#text")) {
      // <p>"text|""t\ext"</p>
      offset = elementBoundOffset(
        neighbor,
        direction,
        isTag(container, "#text") ? 1 : 0
      );

      return new RelPosition(neighbor, offset, root);
    } else if (isTag(neighbor, "br")) {
      const nneighbor = neighborSibling(neighbor);
      if (isTag(nneighbor, "#text")) {
        // <p>"text|"<br>"\text"</p>
        offset = elementBoundOffset(nneighbor, direction);
        return new RelPosition(nneighbor, offset, root);
      }
      if (!nneighbor) {
        return null;
      }
      // <p>"|"<br>"\"</p>
      // <p>"|"<br>\<b></b></p>
      offset = indexOfNode(nneighbor);
      return new RelPosition(nneighbor.parentElement, offset, root);
    } else if (isTag(neighbor, "label")) {
      return new RelPosition(neighbor, 0, root);
    } else {
      inner = innerBorderChild(neighbor);
      if (inner) {
        // <p>"text|"<b>"\text"</b></p>
        // <p>"text"<b>"text\"</b>"|text"</p>
        if (isTag(inner, "#text")) {
          offset = elementBoundOffset(inner, direction);
          return new RelPosition(inner, offset, root);
        } else {
          // <p>"text"<b><i></i>\</b>"|text"</p>
          // <p>"text|"<b>\<i></i>\</b></p>
          offset = indexOfNode(inner);
          if (direction === "left") {
            offset++;
          }
          return new RelPosition(inner.parentElement, offset, root);
        }
      }
      // <p>"text|"<b>\<br></b></p>
      // <p>"text|"<b>\</b></p>
      return new RelPosition(neighbor, 0, root);
    }
  }

  // <p>"text|"</p>
  if (container.parentElement === root) {
    return null;
  }

  // boundary
  // <b><i>text<label>|</label>/</i></b>
  container = container.parentElement;
  neighbor = neighborSibling(container);
  if (neighbor) {
    if (isTag(neighbor, "#text")) {
      // <p><b>"text|"</b>"\text"</p>
      offset = elementBoundOffset(neighbor, direction);
      return new RelPosition(neighbor, offset, root);
    } else {
      // <p><b>"|"</b>\<br></p> -> (#text, 0) -> (p, 1)
      // <p><br>\<b>"|"</b></p> -> (#text, 0) -> (p, 1)
      // <p><b>"|"</b>\<b></b></p> -> (#text, 0) -> (p, 1)
      if (direction === "left") {
        offset = indexOfNode(container);
      } else {
        offset = indexOfNode(neighbor);
      }

      return new RelPosition(neighbor.parentElement, offset, root);
    }
  }
  // boundary without parent neighbor
  // <p><i>\<b>"|"</b>\</i></p>
  offset = indexOfNode(container);
  if (direction === "right") {
    offset++;
  }
  return new RelPosition(container.parentElement, offset, root);
}

export function previousValidPosition(
  root: HTMLElement,
  container?: Node,
  offset?: number
): RelPosition | null {
  const res = neighborValidPosition(root, "left", container, offset);
  // if(res){
  //   console.log(["previousCaretPosition", res, indexOfNode(res.container)]);
  // }
  return res;
}

export function nextValidPosition(
  root: HTMLElement,
  container?: Node,
  offset?: number
): RelPosition | null {
  const res = neighborValidPosition(root, "right", container, offset);
  // if(res){
  //   console.log(["nextCaretPosition", res, indexOfNode(res.container)]);
  // }
  return res;
}

/**
 * "|text"
 * <p>|</p>
 * <p>"|text"</p>
 * <p>"|"<br></p>
 * <p>|<br></p>
 * <p>|<i></i></p>
 * <p>|<label></label></p>
 * @param root
 */
export function firstValidPosition(root: Node): RelPosition {
  if (isTag(root, "#text")) {
    return new RelPosition(root, 0, root);
  }
  const first = firstValidChild(root, {});
  if (first && isTag(first, "#text")) {
    return new RelPosition(first, 0, root);
  }

  return new RelPosition(root, 0, root);
}
/**
 * "text|"
 * <p>|</p>
 * <p>"text|"</p>
 * <p><br>"|"</p>
 * <p><br>|</p>
 * <p><i></i>|</p>
 * <p><label></label>|</p>
 * @param root
 */
export function lastValidPosition(root: Node): RelPosition {
  if (isTag(root, "#text")) {
    return new RelPosition(root, root.textContent.length, root);
  }
  const last = lastValidChild(root, {});
  if (last && isTag(last, "#text")) {
    return new RelPosition(last, last.textContent.length, root);
  }
  return new RelPosition(root, root.childNodes.length, root);
}

export function createPosition(
  root: HTMLElement,
  container: Node,
  offset: number
): RelPosition {
  return new RelPosition(container, offset, root);
}

export function currentPosition(root: HTMLElement): RelPosition | null {
  const sel = document.getSelection();
  if (sel) {
    var container = sel.focusNode;
    var offset = sel.focusOffset;
    return new RelPosition(container, offset, root);
  }
  return null;
}

export function firstNeighborTextNode(el: Node): Node {
  var valid = el;
  while (el) {
    el = previousValidNode(el, { emptyText: true });
    if (el && isTag(el, "#text")) {
      valid = el;
    } else {
      break;
    }
  }
  return valid;
}

export function lastNeighborTextNode(el: Node): Node {
  var valid = el;
  while (el) {
    // el = el.nextSibling as Text;
    el = nextValidNode(el);
    if (el && isTag(el, "#text")) {
      valid = el as Text;
    } else {
      break;
    }
  }
  return valid;
}

export function validChildNodes(el: Node, condition?: Condition): Node[] {
  var res = [];
  for (var i = 0; i < el.childNodes.length; i++) {
    if (isValidTag(el.childNodes[i], condition)) {
      res.push(el.childNodes[i]);
    }
  }
  return res;
}

export function getTagName(el: Node): ElementTagName {
  if (!el) {
    return null;
  }
  return el.nodeName.toLowerCase() as ElementTagName;
}

export function isTag(el: Node, name: ElementTagName) {
  return getTagName(el) === name;
}

export function isParent(cur: Node, parent: Node): boolean {
  while (cur) {
    if (cur === parent) {
      return true;
    }
    cur = cur.parentNode as Node;
  }
  return false;
}

export function isInLabelBound(
  root: HTMLElement,
  direction: "left" | "right",
  container?: Node,
  offset?: number
): HTMLLabelElement {
  if (!container) {
    const sel = document.getSelection()!;
    container = sel.focusNode!;
    offset = sel.focusOffset;
  }
  if (isTag(container, "label")) {
    return container as HTMLLabelElement;
  }

  if (isTag(container, "#text")) {
    if (
      (offset !== 0 && direction === "left") ||
      (offset !== container.textContent.length && direction === "right")
    ) {
      // <p><b>"te|xt"</b></p>
      return null;
    }
    const neighbor =
      direction === "left"
        ? previousValidNode(container)
        : nextValidNode(container);

    if (neighbor && isTag(neighbor, "label")) {
      // <p><b>"text"|"text"</b></p>
      return neighbor as HTMLLabelElement;
    }
  }
  return null;
}

export function findParentMatchTagName(
  el: Node,
  name: ElementTagName,
  root: Node
): HTMLElement | null {
  var cur = el as HTMLElement;
  while (cur && cur !== root) {
    if (isTag(cur, name)) {
      return cur;
    }
    cur = cur.parentElement;
  }
  return null;
}

export function findTopNode(el: Node, root: HTMLElement) {
  while (el && el.parentElement !== root) {
    el = el.parentElement;
  }
  if (el.parentElement !== root) {
    return null;
  }
  return el;
}

export function indexOfNode(el: Node, name?: ElementTagName) {
  let i = 0;
  while ((el = el.previousSibling)) {
    if (name) {
      if (isTag(el, name)) {
        i++;
      }
    } else {
      i++;
    }
  }
  return i;
}

export function elementBoundOffset(
  el: Node,
  direction: "left" | "right",
  offset?: number
) {
  offset = offset || 0;
  if (isTag(el, "#text")) {
    if (direction === "left") {
      return el.textContent.length - offset;
    }
    return 0 + offset;
  }
  return 0;
}

/**
 * <br> = 1
 * "text" = 4
 * <i></i> = 2
 * <i>"text"</i> = 6
 * <i>"text"</i> = 8
 * @param el
 */
export function elementCharSize(el: Node, es: boolean = true): number {
  if (!isValidTag(el)) {
    return 0;
  }
  if (isTag(el, "#text")) {
    // |t|e|x|t|
    return el.textContent.length;
  } else if (isTag(el, "br")) {
    // |<br>|
    if (es) {
      return 1;
    }
  } else if (isTag(el, "label")) {
    // |<label>[any]</label>|
    return 2;
  } else {
    var innerSize = 0;
    validChildNodes(el).forEach((item) => {
      innerSize += elementCharSize(item, es);
    });
    if (es) {
      innerSize += 2;
    }
    return innerSize;
  }
}

/**
 * <p>|</p> -> 0
 * <p>text|</p> -> 4
 * <p>t<i></i>ext|</p> -> 6
 * <p>t<i></i><b></b>ext|</p> -> 8
 * <p>t<b><i></i></b>ext|</p> -> 8
 * <p>t<b><label></label></b>ext|</p> -> 8
 *
 * 文本按文本的长度计算，一个 element 占额外 2 个字符
 * @param root
 * @param es : element size
 * @returns
 */
export function getCaretReletivePosition(
  root: HTMLElement,
  container?: Node,
  offset?: number,
  es: boolean = true
): number {
  const sel = document.getSelection();

  if (!container) {
    container = sel.focusNode;
    offset = sel.focusOffset;
  }

  if (!isParent(container, root)) {
    return 0;
  }

  let size = 0;
  if (container === root) {
    for (let i = 0; i < offset; i++) {
      size += elementCharSize(container.childNodes[i], es);
    }
    return size;
  }

  while (container !== root) {
    if (isTag(container, "#text")) {
      size += offset;
    } else {
      // size++;
    }

    offset = indexOfNode(container);

    for (let i = 0; i < offset; i++) {
      size += elementCharSize(container.parentElement.childNodes[i], es);
    }
    container = container.parentElement;
    if (container !== root) {
      size++;
      offset = indexOfNode(container);
    }
  }
  return size;
}

export function getCaretReletivePositionAtLastLine(root: HTMLElement): number {
  const { lineNumber, lineHeight } = getLineInfo(root);
  if (lineNumber <= 1) {
    return getCaretReletivePosition(root);
  }
  const realOffset = getCaretReletivePosition(root);
  const range = document.createRange();
  // 获取最后一行的所有 contents
  var last = lastValidChild(root);
  while (last) {
    range.selectNode(last);
    if (isTag(last, "br")) {
      return realOffset - getCaretReletivePosition(root, last, 0) - 1;
    }

    if (Math.round(range.getBoundingClientRect().height / lineHeight) <= 1) {
      last = previousValidNode(last);
    } else {
      if (isTag(last, "#text")) {
        // TODO change to binery search
        range.setEnd(last, last.textContent.length);
        range.setStart(last, 0);
        var lineOffset = 0;
        while (
          Math.round(range.getBoundingClientRect().height / lineHeight) > 1
        ) {
          lineOffset++;
          range.setStart(last, lineOffset);
        }

        return realOffset - getCaretReletivePosition(root, last, lineOffset);
      } else {
        last = lastValidChild(last);
      }
    }
  }
}

export function getLineInfo(root: HTMLElement): {
  lineNumber: number;
  lineHeight: number;
  elHeight: number;
} {
  if (root.childNodes.length === 0) {
    return {
      lineHeight: root.offsetHeight,
      lineNumber: 1,
      elHeight: root.offsetHeight,
    };
  }

  const test = createElement("span", {
    textContent: " ",
  });
  const newLine = createElement("br");

  root.appendChild(test);
  const lineA = test.getClientRects()[0];
  root.insertBefore(newLine, root.firstChild);
  const lineB = test.getClientRects()[0];

  const first = newLine.getClientRects()[0];

  const lineHeight = lineB.y - lineA.y;
  const lastPadding = lineHeight - lineA.height;
  const offsetHeight = lineB.bottom - first.top + lastPadding;

  test.remove();
  newLine.remove();

  //   const oldOverFlow = root.style.overflow;
  //   const oldWhiteSpace = root.style.whiteSpace;
  //   root.style.overflow = "hidden";
  //   root.style.whiteSpace = "nowrap";

  //   const lineHeight = root.offsetHeight;
  //   root.style.overflow = oldOverFlow;
  //   root.style.whiteSpace = oldWhiteSpace;

  //   const lineNumber = Math.round(root.offsetHeight / lineHeight);
  const lineNumber = Math.round(offsetHeight / lineHeight) - 1;
  console.log(lineNumber);
  return {
    lineNumber: lineNumber,
    lineHeight,
    elHeight: offsetHeight,
  };
}

export function isCursorLeft(
  root: HTMLElement,
  container?: Node,
  offset?: number
) {
  if (!firstValidChild(root, { emptyText: false })) {
    return true;
  }

  if (!container) {
    const sel = document.getSelection();
    container = sel.focusNode;
    offset = sel.focusOffset;
  }

  if (!previousValidPosition(root, container, offset)) {
    return true;
  }
  return false;
}

/**
 * 什么情况下是最右侧元素？
 * 一路都处在最右侧，到根节点为止，一直在最右侧
 * <p>|</p>
 * <p>text|</p>
 * <p>text<i>text</i>|</p>
 * <p>text<i></i>|</p>
 * @param root 根元素
 * @returns
 */
export function isCursorRight(
  root: HTMLElement,
  container?: Node,
  offset?: number
) {
  if (!firstValidChild(root, { emptyText: false })) {
    return true;
  }
  if (!container) {
    const sel = document.getSelection();
    container = sel.focusNode;
    offset = sel.focusOffset;
  }

  // let pos = lastValidPosition(root);

  // if (pos.container === container && pos.offset === offset) {
  //   return true;
  // }

  if (!nextValidPosition(root, container, offset)) {
    return true;
  }
  return false;
}

export function isFirstLine(el: HTMLElement) {
  if (el.childNodes.length === 0) {
    return true;
  }
  const sel = document.getSelection();
  const test = createElement("span", {
    textContent: "|",
  });
  el.insertBefore(test, el.firstChild);
  const first = test.getClientRects();
  sel.getRangeAt(0).insertNode(test);
  const second = test.getClientRects();
  test.remove();
  return first[0].y === second[0].y;
}

// export function isFirstLine(el: HTMLElement) {
//   if (el.childNodes.length === 0) {
//     return true;
//   }
//   const sel = document.getSelection();
//   if (
//     isTag(sel.anchorNode, "br") ||
//     isTag(sel.anchorNode.childNodes[sel.anchorOffset], "br")
//   ) {
//     return false;
//   }
//   const range = sel.getRangeAt(0).cloneRange();
//   const cpos = range.getClientRects();
//   const epos = el.getClientRects();
//   if (cpos.length === 0) {
//     return true;
//   }
//   return cpos[0].y - cpos[0].height < epos[0].y;
// }

export function isLastLine(el: HTMLElement) {
  if (el.childNodes.length === 0) {
    return true;
  }
  const sel = document.getSelection();
  const test = createElement("span", {
    textContent: " ",
  });
  el.appendChild(test);
  const first = test.getClientRects();
  sel.getRangeAt(0).insertNode(test);
  const second = test.getClientRects();
  test.remove();
  return first[0].y === second[0].y;
}
// export function isLastLine(el: HTMLElement) {
//   if (el.childNodes.length === 0) {
//     return true;
//   }
//   const sel = document.getSelection();
//   const range = sel.getRangeAt(0).cloneRange();
//   const cpos = range.getClientRects();
//   const epos = el.getClientRects();
//   if (cpos.length === 0) {
//     return true;
//   }
//   return cpos[0].y + 2 * cpos[0].height > epos[0].y + epos[0].height;
// }

/**
 *
 * <p>|</p> 3
 * <p>|</p> 0
 * <p>te|xt</p> 2
 * <p>text|<i></i></p> 4
 * <p>text<i>|</i></p> 5
 * <p>text<i><b>|text</b></i></p> 6
 * <p>text<i><b>te|xt</b></i></p> 8
 * <p>text<i><b>text</b>|</i></p> 11
 * <p>text<i></i>|</p> 6
 * <p>text<i>text</i>|<b>text</b></p> 10
 * <p>text<b><i>text</i></b>|<b>text</b></p> 12
 * <p>text<b><i>text</i>|<i></i></b><b>text</b></p> 11
 * <p>text<b><i>text</i>|text<i></i></b><b>text</b></p> 11
 *
 *
 * @param root
 * @param offset
 */
export function setCaretReletivePosition(
  root: HTMLElement,
  offset: number,
  range?: Range
) {
  if (offset < 0) {
    offset += getContentSize(root) + 1;
    if (offset < 0) {
      offset = 0;
    }
  }

  if (!range) {
    const sel = document.getSelection();
    range = sel.getRangeAt(0);
  }
  // debugger;
  var cur = firstValidChild(root);
  var historyOffset = 0;
  // range.setStart(cur, offset - curOffset);
  // range.setEnd(cur, offset - curOffset);
  if (offset === 0) {
    if (isTag(cur, "#text")) {
      range.setStart(cur, 0);
      range.setEnd(cur, 0);
    } else {
      range.setStart(root, 0);
      range.setEnd(root, 0);
    }
    return true;
  }
  while (cur) {
    const curOffset = elementCharSize(cur);
    if (curOffset + historyOffset < offset) {
      cur = nextValidNode(cur, { emptyText: false });
      historyOffset += curOffset;
    } else {
      if (isTag(cur, "#text")) {
        range.setStart(cur, offset - historyOffset);
        range.setEnd(cur, offset - historyOffset);
        return true;
      } else if (isTag(cur, "br")) {
        // hidden condition: curOffset(1) + historyOffset === offset
        // "text"<br>|<br> -> 5
        // "text"<br>"|text" -> 5
        setPosition(
          nextValidPosition(root, cur.parentElement, indexOfNode(cur)),
          true,
          true,
          range
        );
        return true;
      } else if (isTag(cur, "label")) {
        // debugger;
        if (curOffset + historyOffset === offset) {
          cur = nextValidNode(cur, { emptyText: false });
          historyOffset += curOffset;
        } else {
          setPosition(createPosition(root, cur, 0), true, true, range);
          return true;
        }
      } else {
        if (curOffset + historyOffset > offset) {
          historyOffset++;
          cur = firstValidChild(cur);
        } else {
          const prev = lastValidPosition(cur);
          setPosition(
            nextValidPosition(root, prev.container, prev.offset),
            true,
            true,
            range
          );
          return true;
        }
      }
    }
  }

  setPosition(lastValidPosition(root), true, true, range);
  return false;
}

/**
 * <p>in first in first in first in first
 * in second in second in second in second in <b>sec
 * ond</b> in thi|rd in third in third in third
 * </p>          ↑
 * <p>old old old| old old old old </p> 11
 * @param root
 * @param offset
 */
export function setCaretReletivePositionAtLastLine(
  root: HTMLElement,
  offset: number,
  range?: Range
) {
  const { lineNumber, lineHeight } = getLineInfo(root);
  if (lineNumber <= 1) {
    return setCaretReletivePosition(root, offset);
  }
  if (!range) {
    range = document.createRange();
  }
  // 获取最后一行的所有 contents
  var last = lastValidChild(root);
  while (last) {
    range.selectNode(last);

    if (isTag(last, "br")) {
      return setCaretReletivePosition(
        root,
        getCaretReletivePosition(root, last, 0) + offset + 1,
        range
      );
    }

    if (Math.round(range.getBoundingClientRect().height / lineHeight) <= 1) {
      last = previousValidNode(last);
    } else {
      if (isTag(last, "#text")) {
        // TODO change to binery search
        range.setEnd(last, last.textContent.length);
        range.setStart(last, 0);
        var lineOffset = 0;
        while (
          Math.round(range.getBoundingClientRect().height / lineHeight) > 1
        ) {
          lineOffset++;
          range.setStart(last, lineOffset);
        }

        return setCaretReletivePosition(
          root,
          getCaretReletivePosition(root, last, lineOffset) + offset,
          range
        );
      } else {
        last = lastValidChild(last);
      }
    }
  }
}

export function setPosition(
  pos?: RelPosition,
  start: boolean = true,
  end: boolean = true,
  range?: Range
): Range {
  if (!pos) {
    return;
  }
  if (!range) {
    const sel = document.getSelection();
    if (sel.rangeCount === 0) {
      range = document.createRange();
      sel.addRange(range);
    } else {
      range = sel.getRangeAt(0);
    }
  }
  // debugger;
  var container = pos.container;
  var offset = pos.offset;

  if (
    !isTag(container, "#text") &&
    isTag(container.childNodes[offset], "#text") &&
    container.childNodes[offset].textContent.length > 0
  ) {
    container = container.childNodes[offset];
    offset = 0;
  }

  if (pos.offset === -1) {
    switch (getTagName(container)) {
      case "#text":
        offset = container.textContent.length;
        break;
      case "label":
        offset = 0;
        break;
      default:
        offset = container.childNodes.length;
    }
  }

  if (start) {
    range.setStart(container, offset);
  }

  if (end) {
    range.setEnd(container, offset);
  }
  return range;
}

export function getContentSize(el: HTMLElement) {
  let size = 0;
  el.childNodes.forEach((item) => {
    size += elementCharSize(item);
  });
  return size;
}

export function makeText(text) {
  return document.createTextNode(text);
}

export function textContentBefore(
  el: HTMLElement,
  focus?: Node,
  offset?: number
) {
  if (!focus) {
    const sel = document.getSelection();
    focus = sel.focusNode;
    offset = sel.focusOffset;
  }
  const range = document.createRange();
  range.setEnd(focus, offset);
  range.setStart(focus, 0);
  return range.cloneContents().textContent;
}

export function extractFragmentsAfter(
  root: HTMLElement,
  container?: Node,
  offset?: number
) {
  if (!container) {
    const sel = document.getSelection();
    container = sel.focusNode;
    offset = sel.focusOffset;
  }
  const left = createPosition(root, container, offset);
  const right = lastValidPosition(root);
  const range = document.createRange();
  range.setStart(left.container, left.offset);
  range.setEnd(right.container, right.offset);
  const frag = range.extractContents();
  return frag;
}

export function cloneFragmentsBefore(
  root: HTMLElement,
  container?: Node,
  offset?: number
) {
  if (!container) {
    const sel = document.getSelection();
    container = sel.focusNode;
    offset = sel.focusOffset;
  }
  const left = firstValidPosition(root);
  const right = createPosition(root, container, offset);
  const range = document.createRange();
  range.setStart(left.container, left.offset);
  range.setEnd(right.container, right.offset);
  const frag = range.cloneContents();
  return frag;
}

export function cloneFragmentsAfter(
  root: HTMLElement,
  container?: Node,
  offset?: number
) {
  if (!container) {
    const sel = document.getSelection();
    container = sel.focusNode;
    offset = sel.focusOffset;
  }
  const left = createPosition(root, container, offset);
  const right = lastValidPosition(root);
  const range = document.createRange();
  range.setStart(left.container, left.offset);
  range.setEnd(right.container, right.offset);
  const frag = range.cloneContents();
  return frag;
}

export function fullText(el: Node) {
  const val = validChildNodes(el).map((item) => item.textContent);
  return val.join("");
}

export function isFullTextNode(el: HTMLElement) {
  const val = [];
  el.childNodes.forEach((item) => {
    if (isValidTag(item) && !isTag(item, "#text")) {
      val.push(item);
    }
  });
  return val.length === 0;
}

export function deleteTextBefore(
  root: HTMLElement,
  focus?: Node,
  offset?: number
) {
  if (!focus) {
    const sel = document.getSelection();
    focus = sel.focusNode;
    offset = sel.focusOffset;
  }
  const range = document.createRange();
  range.setEnd(focus, offset);
  range.setStart(root, 0);
  range.deleteContents();
}

export function previousTextRange(
  root: HTMLElement,
  container?: Node,
  offset?: number
): Range {
  if (!container) {
    const sel = document.getSelection();
    container = sel.focusNode;
    offset = sel.focusOffset;
  }

  const pos = previousValidPosition(root, container, offset);
  const range = document.createRange();
  if (!pos) {
    return null;
  }

  range.setStart(pos.container, pos.offset);
  range.setEnd(container, offset);
  return range;
}
