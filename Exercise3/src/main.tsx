
import React from "react";
import { createRoot } from "react-dom/client";
import DataFeed from "./state-machine";
import "./DataFeed.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(
  <React.StrictMode>
    <DataFeed />
  </React.StrictMode>
);
