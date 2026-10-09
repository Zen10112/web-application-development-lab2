
import { createElement, renderToDOM } from "./mini-react.js";

const vApp = createElement(
  "main",
  { id: "root-view" },

  createElement(
    "header",
    { className: "hero" },
    createElement("h1", null, "Mini React Engine"),
    createElement(
      "p",
      null,
      '<img src="x" onerror="alert(1)"> Safe Text'
    )
  ),

  createElement(
    "button",
    {
      type: "button",
      onClick: () => console.log("Ping")
    },
    "Test button"
  )
);

const root = document.getElementById("app");

root.replaceChildren(renderToDOM(vApp));

console.assert(
  root.querySelector("main#root-view") !== null,
  "Main mount failed"
);

console.assert(
  root.querySelector("header.hero") !== null,
  "Header mount failed"
);

console.assert(
  root.querySelector("button") !== null,
  "Button mount failed"
);

console.assert(
  root.querySelector("img") === null,
  "XSS protection failed"
);

console.log("Verification completed");
