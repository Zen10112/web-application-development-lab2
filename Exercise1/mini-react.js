
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
  const normalizedChildren = children.map(child =>
    typeof child === "object" && child !== null
      ? child
      : createTextElement(child)
  );

  return {
    type,
    props: {
      ...(props ?? {}),
      children: normalizedChildren
    }
  };
}

export function renderToDOM(vNode) {
  // 1. Create Real DOM Node
  const dom =
    vNode.type === "TEXT_ELEMENT"
      ? document.createTextNode(vNode.props.nodeValue)
      : document.createElement(vNode.type);

  // 2. Handle Props
  Object.entries(vNode.props).forEach(([key, value]) => {
    if (key === "children" || key === "nodeValue") {
      return;
    }

    // Handle event listeners
    if (key.startsWith("on") && typeof value === "function") {
      const eventName = key.slice(2).toLowerCase();
      dom.addEventListener(eventName, value);
    }
    // Handle className
    else if (key === "className") {
      dom.setAttribute("class", value);
    }
    // Handle other attributes
    else if (!key.startsWith("on") && value != null) {
      dom.setAttribute(key, value);
    }
  });

  // 3. Recursively render children
  const children = vNode.props.children || [];

  children.forEach(child => {
    const childDOM = renderToDOM(child);
    dom.appendChild(childDOM);
  });

  // 4. Return Real DOM Node
  return dom;
}
