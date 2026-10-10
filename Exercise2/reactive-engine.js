
const stateEngine = (() => {
  // Private state storage
  const stateStore = [];
  let cursor = 0;
  let renderTrigger = null;

  // Reset cursor before each re-render
  function resetCursor() {
    cursor = 0;
  }

  // Register re-render callback
  function registerRenderTrigger(callback) {
    if (typeof callback !== "function") {
      throw new TypeError("Render trigger must be a function");
    }

    renderTrigger = callback;
  }

  // Prepare re-render mechanism
  function triggerRender() {
    if (typeof renderTrigger === "function") {
      renderTrigger();
    }
  }
  
function useState(initialValue) {
  const currentCursor = cursor;

  // Initialize state on first render
  if (!(currentCursor in stateStore)) {
    stateStore[currentCursor] = initialValue;
  }

  // Update state and trigger re-render
  function setState(newValue) {
    const previousValue = stateStore[currentCursor];

    const nextValue =
      typeof newValue === "function"
        ? newValue(previousValue)
        : newValue;

    stateStore[currentCursor] = nextValue;

    // Reset cursor before re-render
    resetCursor();

    // Trigger application re-render
    triggerRender();
  }

  // Move cursor to the next hook
  cursor++;

  return [stateStore[currentCursor], setState];
}


  return {
  resetCursor,
  registerRenderTrigger,
  triggerRender,
  useState
};
})();

// Export public API
export const {
  resetCursor,
  registerRenderTrigger,
  triggerRender,
  useState
} = stateEngine;


import { renderToDOM } from "./mini-react.js";

// Root event delegation storage
const rootEventHubs = new WeakMap();

function createDelegatedDOM(vNode, handlers) {
  if (vNode == null || typeof vNode !== "object") {
    throw new TypeError("Invalid VNode");
  }

  const { type, props = {} } = vNode;

  // Text nodes are rendered safely
  if (type === "TEXT_ELEMENT") {
    return document.createTextNode(props.nodeValue);
  }

  // Extract event handlers from VNode props
  const { children = [], ...attributes } = props;
  const safeProps = {};

  for (const [key, value] of Object.entries(attributes)) {
    if (key.startsWith("on")) {
      if (typeof value === "function") {
        const eventName = key.slice(2).toLowerCase();

        if (eventName === "click") {
          safeProps["data-event-id"] = String(handlers.length);

          handlers.push(value);
        }
      }
    } else {
      safeProps[key] = value;
    }
  }

  // Render element without attaching child listeners
  const dom = renderToDOM({
    type,
    props: {
      ...safeProps,
      children: []
    }
  });

  // Recursively render children
  for (const child of children) {
    dom.appendChild(createDelegatedDOM(child, handlers));
  }

  return dom;
}

export function renderApp(rootElement, Component) {
  if (!(rootElement instanceof Element)) {
    throw new TypeError("rootElement must be a DOM Element");
  }

  if (typeof Component !== "function") {
    throw new TypeError("Component must be a function");
  }

  let hub = rootEventHubs.get(rootElement);

  // Attach one click listener per root
  if (!hub) {
    hub = {
      handlers: [],
      component: Component
    };

    rootElement.addEventListener("click", event => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const element = target.closest("[data-event-id]");

      if (!element || !rootElement.contains(element)) {
        return;
      }

      const id = Number(element.dataset.eventId);
      const handler = hub.handlers[id];

      if (typeof handler === "function") {
        handler(event);
      }
    });

    rootEventHubs.set(rootElement, hub);
  }

  hub.component = Component;

  function rerender() {
    // Reset hook cursor before executing Component
    resetCursor();

    // Generate updated VNode tree
    const vNode = hub.component();

    // Build new handler mapping
    const nextHandlers = [];

    // Convert VNode to Real DOM
    const dom = createDelegatedDOM(vNode, nextHandlers);

    // Replace old DOM
    rootElement.replaceChildren(dom);

    // Activate handlers for the new DOM
    hub.handlers = nextHandlers;
  }

  // Register state update callback
  registerRenderTrigger(rerender);

  // Initial render
  rerender();
}
