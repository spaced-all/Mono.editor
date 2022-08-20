import { dom } from "../../utils";

import { ABCListHandler } from "../aList";

import { List } from "./serializer";

export class ListHandler extends ABCListHandler {
  serializer: List;
}
