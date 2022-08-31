/**
 * see tutorials
 * https://Imagersblock.com/blog/highlight-text-inside-a-textarea/
 * https://css-tricks.com/creating-an-editable-textarea-that-supports-syntax-highlighted-Image/
 */
import {
  renderInlineElement,
  serializeInlineElement,
} from "../../Inlines/serializer";
import { InlineElement } from "../../Inlines/types";
import { HTMLElementTagName } from "../../types/dom";
import { createElement } from "../../utils/contrib";
import {
  ABCBlockElement,
  BlockHandler,
  ElementProps,
  ElementState,
} from "../aBlock";
import { ElementType, ImageData } from "../types";

import { ImageHandler } from "./handler";
import { dom, time } from "../../utils";
import { Renderable } from "../../types/renderable";
import produce from "immer";

export interface SerializeMessage {
  insert?: boolean;
  activate?: boolean;
}
export interface ImageProps extends ElementProps {
  className?: string;
}
export interface ImageState extends ElementState {
  activate?: boolean;
}

export class Image extends ABCBlockElement<ImageProps, ImageState> {
  static elName: string = "image";
  readonly blockType: string = "image";
  elementType: ElementType = "card";

  image: HTMLImageElement;
  input: HTMLInputElement;
  caption: HTMLElement;

  public get contentEditableName(): HTMLElementTagName {
    return "figure";
  }

  public get placeholder(): string | undefined {
    return undefined;
  }

  constructor(props: ImageProps) {
    super(props);
  }

  public get data(): ImageData {
    return this.state.data.image;
  }

  public get size(): number {
    return this.data.size || 100;
  }

  public get handlerType(): typeof ImageHandler {
    return ImageHandler;
  }

  childrenDidMount(): void {}

  serialize(): ImageData {
    const lastEditTime = time.getTime();
    const newData = produce(this.data, (draft) => {
      draft.size = parseFloat(this.image.getAttribute("data-size"));
      draft.caption = serializeInlineElement(dom.validChildNodes(this.caption));
      draft.lastEditTime = lastEditTime;
    });
    return newData;
  }

  bigger() {
    this.updateImage(null, this.size + 10);
  }
  smaller() {
    this.updateImage(null, this.size - 10);
  }

  updateImage(src?: string, size?: number) {
    if (src) {
      this.image.src = src;
    }
    if (size) {
      size = Math.min(Math.max(size, 10), 100);
      this.image.setAttribute("data-size", `${size}`);
      this.image.style.width = `${size}%`;
    }

    const newData = produce(this.data, (draft) => {
      if (src) {
        draft.src = src;
      }
      if (size) {
        draft.size = size;
      }
    });
    this.updateData(newData);
  }

  renderInner(): [Node[], Renderable[]] {
    console.log("Render Inner Image");
    const img = createElement("img");
    img.src = this.data.src;
    img.setAttribute("data-size", `${this.size}`);
    img.style.width = `${this.size}%`;

    const caption = createElement("figcaption");
    // caption.contentEditable = "true";
    let renderables = [];
    let nodes = [];
    if (this.data.caption) {
      [nodes, renderables] = renderInlineElement(this.data.caption);
      nodes.forEach((c) => caption.appendChild(c));
    }
    this.image = img;
    this.caption = caption;

    const input = createElement("input");
    this.input = input;
    this.input.style.display = "none";
    this.input.value = this.data.src;
    return [[img, caption, input], renderables];
    // return [];
  }

  showInput() {
    this.input.style.display = null;
    this.input.focus();
  }

  closeInput() {
    if (this.input.style.display === "none") {
      return;
    }
    this.updateImage(this.input.value);
    this.input.style.display = "none";
  }

  // renderOuter(): HTMLElement {
  //   const outer = super.renderOuter();
  //   return outer;
  // }
}
