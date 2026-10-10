
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