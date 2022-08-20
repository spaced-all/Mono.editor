import { registerManager } from "../utils/register";
import { ABCInline, ABCInlineStatic, DefaultInline } from "./abc";
import { IMath } from "./math";

export const extendInline =
  registerManager.create<typeof DefaultInline>("extend-inline");
export const shortcuts = registerManager.create("inline-shortcuts");

export function registerInlineExtention<T extends ABCInlineStatic>(inline: T) {
  extendInline.put(inline.elName, inline as any);
  shortcuts.put(inline.shortcut, inline);
}

registerInlineExtention<typeof IMath>(IMath);
