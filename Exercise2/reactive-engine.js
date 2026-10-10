
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

  return {
    resetCursor,
    registerRenderTrigger,
    triggerRender
  };
})();

// Export public API
export const {
  resetCursor,
  registerRenderTrigger,
  triggerRender
} = stateEngine;
