import { HTMLElementTagName, HTMLElementType } from "./dom";
import { Handler } from "./eventHandler";
import { Noticable } from "./noticable";

export abstract class Renderable implements Noticable {
  root: HTMLElementType;
  handler: Handler;
  notifyQueue: Noticable[];

  abstract render(): HTMLElementType;
  serialize() {}

  constructor() {
    this.notifyQueue = [];
  }
  notify(): void {
    this.componentDidMount();

    this.notifyQueue.forEach((c) => {
      console.log(["notify", c]);
      c.componentDidMount();
      c.notify();
      c.componentDidRendered();
    });
    this.componentDidRendered();
    // clear
  }
  notifyRemove() {
    this.componentDidUnmount();
    this.notifyQueue.forEach((c) => {
      c.notify();
      c.componentDidUnmount();
    });
  }
  componentDidMount(): void {}
  componentDidUnmount(): void {}
  componentDidRendered(): void {}

  pushNotify(...noticable: Noticable[]) {
    this.notifyQueue.push(...noticable);
    console.log(noticable);
  }

  insert() {
    this.render();
    const range = document.getSelection().getRangeAt(0);
    range.insertNode(this.root);
    this.notify();
    return this;
  }

  insertAfter(el: HTMLElement) {
    this.render();
    el.insertAdjacentElement("afterend", this.root);
    this.notify();
    return this;
  }

  insertBefore(el: HTMLElement) {
    this.render();
    el.insertAdjacentElement("beforebegin", this.root);
    this.notify();
    return this;
  }

  remove() {
    this.root.remove();
    this.notifyRemove();
    return this.root;
  }

  replace(el: HTMLElement) {
    this.render();
    el.replaceWith(this.root);
    this.notify();
    return this;
  }
  replaceChildren(el) {
    this.render();
    el.replaceChildren(this.root);
    this.notify();
    return this;
  }

  lazyRender(): [HTMLElementType, Noticable] {
    return [this.render(), this];
  }
}
