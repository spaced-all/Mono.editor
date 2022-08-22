/**
 * see tutorials
 * https://Imagersblock.com/blog/highlight-text-inside-a-textarea/
 * https://css-tricks.com/creating-an-editable-textarea-that-supports-syntax-highlighted-Image/
 */
import { renderInlineElement } from "../../Inlines/serializer";
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
import { dom } from "../../utils";
import { Renderable } from "../../types/renderable";

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

  public set size(v: number) {
    this.data.size = v;
    Math.min(Math.max(v, 10), 100);
    this.image.style.width = `${v}%`;
  }

  childrenDidMount(): void {}

  updateImage(src) {}

  public get handlerType(): typeof ImageHandler {
    return ImageHandler;
  }

  renderInner(): [Node[], Renderable[]] {
    const img = createElement("img");
    img.src = this.data.src;
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

    return [[img, caption], renderables];
    // return [];
  }
  renderOuter(): HTMLElement {
    const outer = super.renderOuter();
    // outer.contentEditable = "false";
    return outer;
  }
}
