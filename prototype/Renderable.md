```js
const page = new Page(pageProps) // Renderable

page.insert()
    {
        const root = page.renderRoot() => HTMLElement
        el.insert(root)
        page.notifyDidMount()
        {
            page.compoentDidMount()
        }
        const [children, notifyable] = page.renderChildren() => HTMLElement, Renderable
        root.append(...children)
        notifyable.forEach(c=>{c.notifyDidMount()})
    }



page.replaceChildren()
// ...



```
