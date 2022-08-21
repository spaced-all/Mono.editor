import { registerManager } from "../utils/register";
import { ABCBlockStatic } from "./aBlock/serializer";

import { Paragraph } from "./Paragraph";
import { Heading } from "./Heading";
import { BlockQuote } from "./Blockquote/serializer";
import { List } from "./List";
import { OrderedList } from "./OrderedList";

import { Table } from "./Table";

import { Code } from "./Code";
import { Image } from "./Image";
import { Equation } from "./Equation";

import { BlockComponentType } from "./types";

export const blockRegister =
  registerManager.create<BlockComponentType>("block");
export const handlerRegister = registerManager.create("block_handler");

export function registerBlockComponent<T extends ABCBlockStatic>(inline: T) {
  blockRegister.put(inline.elName, inline as any);
}

registerBlockComponent<typeof Paragraph>(Paragraph);
registerBlockComponent<typeof BlockQuote>(BlockQuote);
registerBlockComponent<typeof Heading>(Heading);
registerBlockComponent<typeof List>(List);
registerBlockComponent<typeof OrderedList>(OrderedList);

registerBlockComponent<typeof Table>(Table);

registerBlockComponent<typeof Code>(Code);
registerBlockComponent<typeof Image>(Image);
registerBlockComponent<typeof Equation>(Equation);
