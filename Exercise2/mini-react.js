

export function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: []
    }
  };
}

export function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...(props ?? {}),
      children: children.map(child =>
        typeof child === "object" && child !== null
          ? child
          : createTextElement(child)
      )
    }
  };
}

export function renderToDOM(vNode) {
  if (vNode == null || typeof vNode !== "object") {
    throw new TypeError("Invalid VNode");
  }

  const { type, props = {} } = vNode;

  if (type === "TEXT_ELEMENT") {
    return document.createTextNode(props.nodeValue);
  }

  const dom = document.createElement(type);

  Object.entries(props).forEach(([key, value]) => {
    if (key === "children" || value == null) {
      return;
    }

    if (
      key.startsWith("on") &&
      typeof value === "function"
    ) {
      const eventName = key.slice(2).toLowerCase();
      dom.addEventListener(eventName, value);
      return;
    }

    if (key === "className") {
      dom.setAttribute("class", value);
      return;
    }

    if (key === "htmlFor") {
      dom.setAttribute("for", value);
      return;
    }

    if (key === "style" && typeof value === "object") {
      Object.assign(dom.style, value);
      return;
    }

    if (key.startsWith("on")) {
      return;
    }

    if (typeof value === "boolean") {
      if (key.startsWith("aria-")) {
        dom.setAttribute(key, String(value));
      } else if (value) {
        dom.setAttribute(key, "");
      }
      return;
    }

    dom.setAttribute(key, String(value));
  });

  (props.children || []).forEach(child => {
    dom.appendChild(renderToDOM(child));
  });

  return dom;
}
