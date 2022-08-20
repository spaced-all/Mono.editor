import { EventAttribute, HTMLElementTagName } from "../types/dom";
import { Handler } from "../types/eventHandler";

export function createTextNode(text: string): Text {
  return document.createTextNode(text);
}

export function createElement<K extends HTMLElementTagName>(
  tagName: K,
  props?: {
    className?: string;
    textContent?: string;
    attributes?: { [key: string]: any };
    eventHandler?: EventAttribute;
    children?: Node[];
    handler?: Handler;
  }
): HTMLElementTagNameMap[K] {
  const {
    className,
    textContent,
    attributes,
    eventHandler,
    children,
    handler,
  } = props || {};

  const el = document.createElement(tagName);
  if (className) {
    el.className = className;
  }
  if (textContent) {
    el.textContent = textContent;
  }
  if (attributes) {
    for (let key in attributes) {
      const value = attributes[key];
      if (value !== undefined) {
        el.setAttribute(key, value);
      }
    }
  }
  if (eventHandler) {
    for (let key in eventHandler) {
      const value = eventHandler[key];
      el.addEventListener(key, value);
    }
  }
  if (children) {
    children.forEach((child) => {
      el.appendChild(child);
    });
  }

  if (handler) {
    el.addEventListener("copy", handler.handleCopy.bind(handler));
    el.addEventListener("paste", handler.handlePaste.bind(handler));
    el.addEventListener("blur", handler.handleBlur.bind(handler));
    el.addEventListener("keydown", handler.handleKeyDown.bind(handler));
    el.addEventListener("keypress", handler.handleKeyPress.bind(handler));
    el.addEventListener("keyup", handler.handleKeyUp.bind(handler));
    el.addEventListener("mousedown", handler.handleMouseDown.bind(handler));

    // should be bind manully
    // el.addEventListener("mouseenter", handler.handleMouseEnter.bind(handler));
    // el.addEventListener("mouseleave", handler.handleMouseLeave.bind(handler));
    el.addEventListener("mouseup", handler.handleMouseUp.bind(handler));
    el.addEventListener("click", handler.handleClick.bind(handler));
    el.addEventListener("input", handler.handleInput.bind(handler));

    el.addEventListener(
      "compositionstart",
      handler.handleCompositionStart.bind(handler)
    );
    el.addEventListener(
      "compositionupdate",
      handler.handleCompositionUpdate.bind(handler)
    );
    el.addEventListener(
      "compositionend",
      handler.handleCompositionEnd.bind(handler)
    );
  }
  return el;
}

// export function putContentItem(
//   el: HTMLElement,
//   contentItem: ContentItem | ContentItem[],
//   refresh: boolean = true
// ) {
//   if (refresh) {
//     el.innerHTML = "";
//   }
//   const [nodes, noticable] = createElement(contentItem);
//   if (nodes) {
//     nodes.forEach((c) => {
//       el.appendChild(c);
//     });
//     noticable.forEach((c) => c.componentDidMount());
//   }
//   return [nodes, noticable];
// }

// export function insertContentItem(
//   el: HTMLElement,
//   contentItem: ContentItem | ContentItem[],
//   range?: Range
// ) {
//   if (!range) {
//     range = document.getSelection().getRangeAt(0);
//   }

//   const [nodes, noticable] = createElement(contentItem);
//   if (nodes) {
//     nodes.reverse().forEach((c) => {
//       range.insertNode(c);
//     });
//     noticable.forEach((c) => c.componentDidMount());
//   }
//   return [nodes, noticable];
// }
