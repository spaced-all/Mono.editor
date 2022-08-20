import { configRegister } from "../config";

const config = configRegister.get("config");
export class HistoryQueue {
  history: any[];
  constructor() {
    this.history = new Array(config.history.maxLength);
  }

  push(data: any) {
    this.history.push(data);
  }
  pop() {
    return this.history.pop();
  }
}
