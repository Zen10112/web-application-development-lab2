
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
