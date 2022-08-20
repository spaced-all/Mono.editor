export class Node<T> {
  _element: T;
  next: Node<T>;
  prev: Node<T>;
  constructor(element, prev?: Node<T>, next?: Node<T>) {
    this._element = element;
    if (next) {
      next.prev = this;
    }
    if (prev) {
      prev.next = this;
    }
    this.next = next;
    this.prev = prev;
  }

  value(): T {
    return this._element;
  }

  setValue(value: T) {
    this._element = value;
  }
}
export class LinkedList<T> {
  head: Node<T>;
  tail: Node<T>;
  constructor() {}

  prepend(value): Node<T> {
    const cur = new Node<T>(value, null, this.head);
    this.head = cur;

    if (!this.tail) {
      this.tail = cur;
    }
    return cur;
  }

  remove(value): Node<T> {
    let cur = this.head;
    while (cur) {
      if (cur._element === value) {
        if (cur.prev) {
          cur.prev.next = cur.next;
        }
        if (cur.next) {
          cur.next.prev = cur.prev;
        }
        if (cur === this.head) {
          this.head = cur.next;
        }
        if (cur === this.tail) {
          this.tail = cur.prev;
        }
        return cur;
      }
      cur = cur.next;
    }
    return null;
  }

  append(value): Node<T> {
    const cur = new Node<T>(value, this.tail);
    if (!this.head) {
      this.head = cur;
    }
    this.tail = cur;
    return cur;
  }

  popNode(): Node<T> {
    const cur = this.tail;
    if (cur) {
      this.tail = cur.prev;
      if (this.tail) {
        this.tail.next = null;
      }
      return cur;
    }
    return null;
  }

  pop(): T {
    const node = this.popNode();
    if (node) {
      return node.value();
    }
    return null;
  }
  toList(): T[] {
    const list = [];
    let cur = this.head;
    while (cur) {
      list.push(cur.value());
      cur = cur.next;
    }
    return list;
  }
}

export type DictKey = string;
export default class LinkedDict<T> {
  dict: { [key: DictKey]: T };
  nodeDict: { [key: DictKey]: Node<DictKey> };
  list: LinkedList<DictKey>;
  cursor: Node<DictKey>;
  constructor() {
    this.dict = {};
    this.nodeDict = {};
    this.list = new LinkedList();
    this.cursor = null;
  }

  set(key: string, value: T): void {
    const cur = this.list.append(key);
    console.log(key, this.list.toList());
    this.dict[key] = value;
    this.nodeDict[key] = cur;
  }

  replace(key: string, value: T) {
    const node = this.getNode(key);
    if (node) {
      this.dict[key] = value;
    }
  }

  remove(key: string) {
    const node = this.getNode(key);
    if (node) {
      const prev = node.prev;
      const next = node.next;
      if (prev) {
        prev.next = next;
      }
      if (next) {
        next.prev = prev;
      }
      delete this.dict[key];
      delete this.nodeDict[key];
    }
  }

  insertAt(newKey: string, value: T, key: string, where: "after" | "before") {
    const node = this.getNode(key);
    if (node) {
      const pair = where === "after" ? [node, node.next] : [node.prev, node];
      const cur = new Node<DictKey>(newKey, pair[0], pair[1]);
      this.dict[newKey] = value;
      this.nodeDict[newKey] = cur;
    } else {
      this.set(newKey, value);
    }
  }

  insertAfter(newKey: string, value: T, key: string) {
    this.insertAt(newKey, value, key, "after");
  }

  insertBefore(newKey: string, value: T, key: string) {
    this.insertAt(newKey, value, key, "before");
  }

  seek(key: string): boolean {
    const node = this.getNode(key);
    if (node) {
      this.cursor = node;
      return true;
    }
    return false;
  }

  firstNode(): Node<DictKey> {
    return this.list.head;
  }
  firstValue(): T {
    const node = this.firstNode();
    if (node) {
      const key = node.value();
      return this.dict[key];
    }
    return null;
  }
  prevNode(): Node<DictKey> {
    if (!this.cursor) {
      return this.firstNode();
    }
    if (!this.cursor.prev) {
      return this.firstNode();
    }
    return this.cursor.prev;
  }
  prevValue(): T {
    const node = this.prevNode();
    if (node) {
      const key = node.value();
      return this.dict[key];
    }
    return null;
  }

  nextNode(): Node<DictKey> {
    if (!this.cursor) {
      return this.lastNode();
    }
    if (!this.cursor.next) {
      return this.lastNode();
    }
    return this.cursor.next;
  }
  nextValue(): T {
    const node = this.nextNode();
    if (node) {
      const key = node.value();
      return this.dict[key];
    }
    return null;
  }
  lastNode(): Node<DictKey> {
    return this.list.tail;
  }
  lastValue(): T {
    const node = this.lastNode();
    if (node) {
      const key = node.value();
      return this.dict[key];
    }
    return null;
  }

  currentValue(): T {
    return this.getValue(this.cursor.value());
  }

  getValue(key: string): T {
    const node = this.getNode(key);
    if (node) {
      const key = node.value();
      return this.dict[key];
    }
    return null;
  }

  getNode(key: string): Node<DictKey> {
    return this.nodeDict[key];
  }

  toKeyList(): DictKey[] {
    const list = [];
    let cur = this.list.head;
    while (cur) {
      const key = cur.value();
      list.push(key);
      cur = cur.next;
    }
    return list;
  }
  toValueList(): T[] {
    const list = [];
    let cur = this.list.head;
    while (cur) {
      const key = cur.value();
      const value = this.dict[key];
      list.push(value);
      cur = cur.next;
    }
    return list;
  }
}
