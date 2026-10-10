
import { createElement } from "./mini-react.js";
import { useState, renderApp } from "./reactive-engine.js";

function TaskApp() {
  const [tasks, setTasks] = useState([
    "Review PR",
    "Verify AST"
  ]);

  const [filter, setFilter] = useState("ALL");

  return createElement(
    "main",
    { className: "app-container" },

    createElement(
      "header",
      null,
      createElement(
        "h2",
        null,
        `Tasks: ${tasks.length}`
      )
    ),

    createElement(
      "button",
      {
        type: "button",
        onClick: () => {
          setTasks([...tasks, `Task ${Date.now()}`]);
        }
      },
      "Add Task"
    ),

    createElement(
      "section",
      { "aria-label": "Task list" },

      createElement(
        "ul",
        null,
        ...tasks.map(task =>
          createElement(
            "li",
            null,
            task
          )
        )
      )
    )
  );
}

const root = document.getElementById("app");

renderApp(root, TaskApp);
