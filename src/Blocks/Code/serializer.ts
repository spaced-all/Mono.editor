/**
 * see tutorials
 * https://codersblock.com/blog/highlight-text-inside-a-textarea/
 * https://css-tricks.com/creating-an-editable-textarea-that-supports-syntax-highlighted-code/
 */
import { renderInlineElement } from "../../Inlines/serializer";
import { InlineElement } from "../../Inlines/types";
import { HTMLElementTagName } from "../../types/dom";
import { createElement } from "../../utils/contrib";
import { ABCBlockElement, ElementProps, ElementState } from "../aBlock";
import { CodeData } from "../types";

import hljs from "highlight.js";
import "highlight.js/styles/github.css";

import { CodeHandler } from "./handler";
import { dom } from "../../utils";
import { Renderable } from "../../types/renderable";

export interface SerializeMessage {
  insert?: boolean;
  activate?: boolean;
}
export interface CodeProps extends ElementProps {
  className?: string;
}
export interface CodeState extends ElementState {
  activate?: boolean;
}

export class Code extends ABCBlockElement<CodeProps, CodeState> {
  constructor(props: CodeProps) {
    super(props);
  }

  static elName: string = "code";
  readonly blockType: string = "code";
  elementType: "text" | "list" | "card" = "card";

  display: HTMLElement;
  edit: HTMLTextAreaElement;
  highlight: HTMLElement;

  public get contentEditableName(): HTMLElementTagName {
    return "pre";
  }

  public get handlerType(): typeof CodeHandler {
    return CodeHandler;
  }

  public get data(): CodeData {
    return this.state.data.code;
  }
  public get code(): string {
    return this.data.code.join("\n");
  }

  public get language(): string {
    return this.data.language || "javascript";
  }

  childrenDidMount(): void {
    this.updateCode(this.code, this.language);
    this.updateLineHighlight(1);
  }

  updateCode(code, language = "javascript") {
    let rcode = code;
    // make sure new line has height
    if (rcode[rcode.length - 1] == "\n") {
      rcode += " ";
    }
    this.display.innerHTML = rcode;
    hljs.highlightElement(this.display);

    if (this.edit.value !== code) {
      this.edit.value = code;
    }
  }

  updateLineHighlight(...line: number[]) {
    const { lineNumber } = dom.getLineInfo(this.display);

    while (this.highlight.childNodes.length > lineNumber) {
      this.highlight.lastChild.remove();
    }

    while (this.highlight.childNodes.length < lineNumber) {
      this.highlight.appendChild(createElement("div", {}));
    }
    const oldLine = this.highlight.getAttribute("data-line");
    if (oldLine) {
      oldLine
        .split(",")
        .map((c) => Number.parseFloat(c))
        .forEach((l) => {
          const child = this.highlight.childNodes[l] as HTMLElement;
          if (child) {
            child.classList.remove("highlight");
          }
        });
    }

    line.forEach((l) => {
      const child = this.highlight.childNodes[l] as HTMLElement;
      if (child) {
        child.classList.add("highlight");
      }
    });
    this.highlight.setAttribute("data-line", line.join(","));
  }

  handleEditInput(e: Event) {
    const code = e.target["value"];
    this.updateCode(code);
  }

  renderInner(): [Node[], Renderable[]] {
    this.display = createElement("code", {
      className: "language-javascript language-css",
    });
    this.highlight = createElement("div", {
      className: "line-highlight",
    });
    this.edit = createElement("textarea", {
      className: "hljs",
      eventHandler: {
        input: this.handleEditInput.bind(this),
      },
    });

    this.outer.setAttribute("data-line", "1");
    // return [this.highlight, this.display, this.edit];
    // 为了便于选中 display ，display 必需在最上层，而且不能有 position: absolute
    return [[this.display, this.highlight, this.edit], []];
    // return [];
  }
}
