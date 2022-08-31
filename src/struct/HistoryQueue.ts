import { configRegister } from "../config";

// 1 -> 2 -> 3 -> 4 -> [5]
//                ↑
// undo
//   isTop?
//        push -> offset-- -> return current
//   isTail?
//        null
//        offset-- -> return current
// commit
//   splice(offset, ...)
// replace
//   = commit
// redo
//   isTop?
//       offset++ -> return current
//       null

const config = configRegister.get("config");
export class HistoryQueue {
  history: any[];
  offset: number;
  constructor() {
    this.history = [];
    this.offset = 0;
  }

  current() {
    return this.history[this.offset - 1];
  }

  isTop() {
    return this.offset === this.history.length;
  }

  isTail() {
    return this.offset === 0;
  }

  push(data: any) {
    this.history.splice(this.offset, this.history.length - this.offset, data);
    this.offset = this.history.length;
  }

  redoData() {
    if (this.isTop()) {
      return null;
    }
    this.offset++;
    return this.current();
  }

  undoData(snap: any) {
    if (this.isTail()) {
      return null;
    }

    if (this.isTop()) {
      this.push(snap);
    }
    this.offset--;
    return this.current();
  }
}

export const historyQueue = new HistoryQueue();
