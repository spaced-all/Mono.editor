import { registerManager } from "../utils/register";
import { ABCBlockStatic } from "./aBlock/serializer";
import { BlockQuote } from "./Blockquote/serializer";
import { Code } from "./Code";
import { Heading } from "./Heading";
import { List } from "./List";
import { OrderedList } from "./OrderedList";

import { Paragraph } from "./Paragraph";
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
registerBlockComponent<typeof Code>(Code);
