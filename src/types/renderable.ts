import { HTMLElementTagName, HTMLElementType } from "./dom";
import { Handler } from "./eventHandler";

export abstract class Renderable {
  root: HTMLElementType;
  handler: Handler;
  childrenQueue: Renderable[];

  serialize() {}

  constructor() {
    this.childrenQueue = [];
  }

  private notifyRootDidMount(): void {
    this.rootDidMount();
    const [children, noticables] = this.renderChildren();
    console.log([this, this.root, children]);
    noticables.forEach((c) => c.render());
    this.root.append(...children);
    this.childrenQueue.push(...noticables);
    noticables.forEach((c) => {
      c.notifyRootDidMount();
    });
    this.notifyDidRendered();
  }
  private notifyDidRendered(): void {
    this.childrenDidMount();
    this.childrenQueue.forEach((c) => {
      c.notifyDidRendered();
    });
  }
  private notifyDidUnMount(): void {
    this.componentDidUnmount();
    this.childrenQueue.forEach((c) => {
      c.notifyDidUnMount();
      c.componentDidUnmount();
    });
    this.childrenQueue = [];
  }

  rootDidMount(): void {}
  componentDidUnmount(): void {}
  childrenDidMount(): void {}

  componentDidUpdate(): void {}

  setHandler(handler) {
    this.handler = handler;
  }

  consumeUpdate(newRenderable: Renderable[]) {
    this.childrenQueue.push(...newRenderable);
    newRenderable.forEach((c) => {
      c.notifyRootDidMount();
    });
  }

  renderChildren(): [Node[], Renderable[]] {
    return [[], []];
  }

  insert() {
    this.render();
    const range = document.getSelection().getRangeAt(0);
    range.insertNode(this.root);
    this.notifyRootDidMount();
    return this;
  }

  insertAfter(el: HTMLElement) {
    this.render();
    el.insertAdjacentElement("beforeend", this.root);
    this.notifyRootDidMount();
    return this;
  }

  insertBefore(el: HTMLElement) {
    this.render();
    el.insertAdjacentElement("afterbegin", this.root);
    this.notifyRootDidMount();
    return this;
  }

  remove() {
    this.root.remove();
    this.notifyDidUnMount();
    return this;
  }

  replace(el: HTMLElement) {
    this.render();
    el.replaceWith(this.root);
    this.notifyRootDidMount();
    return this;
  }
  replaceChildren(el) {
    this.render();
    el.replaceChildren(this.root);
    this.notifyRootDidMount();
    return this;
  }

  lazyRender(): [HTMLElementType, Renderable] {
    return [this.render(), this];
  }

  renderRoot(): HTMLElement {
    return;
  }

  private render() {
    if (!this.root) {
      this.root = this.renderRoot();
    }
    return this.root;
  }
}
