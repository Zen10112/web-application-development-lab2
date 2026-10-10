
import {
  createElement as h,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

// ====================================
// 1. TYPE DEFINITIONS
// ====================================

export type Item = {
  id: string | number;
  title: string;
  content?: string;
};

export type ViewState<T> =
  | { status: "IDLE" }
  | { status: "LOADING" }
  | { status: "SUCCESS"; data: T }
  | { status: "ERROR"; error: string };

// ====================================
// 2. MOCK API
// ====================================

const mockItems: Item[] = [
  {
    id: 1,
    title: "Review PR",
    content: "Review pending pull requests"
  },
  {
    id: 2,
    title: "Verify AST",
    content: "Validate abstract syntax tree"
  },
  {
    id: 3,
    title: "Update Documentation",
    content: "Update project documentation"
  }
];

// Test controls (development only)
let forceError = false;
let mockDelay = 1500;

export function setMockError(value: boolean): void {
  forceError = value;
}

export function setMockDelay(ms: number): void {
  mockDelay = Math.max(0, ms);
}

export async function fetchFeed(): Promise<Item[]> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, mockDelay);
  });

  // Forced error or 30% random failure
  if (forceError || Math.random() < 0.3) {
    throw new Error(
      "Network error: Unable to fetch data."
    );
  }

  return mockItems.map((item) => ({ ...item }));
}

// ====================================
// 3. REACTIVE STATE HOOK
// ====================================

export function useDataFeed() {
  const [state, setState] = useState<ViewState<Item[]>>({
    status: "IDLE"
  });

  const requestIdRef = useRef<number>(0);
  const mountedRef = useRef<boolean>(false);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      requestIdRef.current++;
    };
  }, []);

  const loadData = useCallback(async (): Promise<void> => {
    const currentRequestId = ++requestIdRef.current;

    setState({ status: "LOADING" });

    try {
      const items = await fetchFeed();

      if (
        !mountedRef.current ||
        currentRequestId !== requestIdRef.current
      ) {
        return;
      }

      setState({
        status: "SUCCESS",
        data: items
      });
    } catch (err: unknown) {
      if (
        !mountedRef.current ||
        currentRequestId !== requestIdRef.current
      ) {
        return;
      }

      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred.";

      setState({
        status: "ERROR",
        error: message
      });
    }
  }, []);

  const retryConnection = useCallback(
    async (): Promise<void> => {
      await loadData();
    },
    [loadData]
  );

  return {
    state,
    loadData,
    retryConnection
  };
}

// ====================================
// 4. SKELETON COMPONENT
// ====================================

function SkeletonScreen() {
  return h(
    "section",
    {
      "aria-label": "Loading feed",
      "aria-busy": true
    },
    h(
      "h2",
      { role: "status" },
      "Loading feed, please wait..."
    ),
    h(
      "ul",
      {
        className: "skeleton-list",
        "aria-hidden": true
      },
      ...[1, 2, 3].map((id) =>
        h(
          "li",
          {
            key: id,
            className: "skeleton-item"
          },
          h(
            "article",
            null,
            h("span", {
              className: "skeleton-box skeleton-title"
            }),
            h("span", {
              className: "skeleton-box skeleton-text"
            }),
            h("span", {
              className: "skeleton-box skeleton-text short"
            })
          )
        )
      )
    )
  );
}

// ====================================
// 5. DATAFEED COMPONENT
// ====================================

export function DataFeed() {
  const { state, loadData, retryConnection } = useDataFeed();

  let content: ReturnType<typeof h>;

  switch (state.status) {
    case "IDLE":
      content = h(
        "section",
        { "aria-label": "Start data loading" },
        h("p", null, "Click to load your feed."),
        h(
          "button",
          {
            type: "button",
            onClick: () => void loadData()
          },
          "Fetch Feed"
        )
      );
      break;

    case "LOADING":
      content = h(
        "section",
        null,
        h(SkeletonScreen),
        h(
          "button",
          {
            type: "button",
            onClick: () => void retryConnection()
          },
          "Retry Connection"
        )
      );
      break;

    case "SUCCESS":
      content = h(
        "section",
        { "aria-labelledby": "feed-heading" },
        h("h2", { id: "feed-heading" }, "Feed Items"),
        h(
          "p",
          { role: "status" },
          `${state.data.length} items loaded successfully.`
        ),
        h(
          "ul",
          { className: "feed-list" },
          ...state.data.map((item) =>
            h(
              "li",
              { key: item.id },
              h(
                "article",
                { className: "feed-card" },
                h("h3", null, item.title),
                item.content
                  ? h("p", null, item.content)
                  : null
              )
            )
          )
        ),
        h(
          "button",
          {
            type: "button",
            onClick: () => void loadData()
          },
          "Refresh Feed"
        )
      );
      break;

    case "ERROR":
      content = h(
        "section",
        {
          className: "error-panel",
          "aria-labelledby": "error-heading"
        },
        h(
          "h2",
          { id: "error-heading" },
          "Unable to load feed"
        ),
        h("p", { role: "alert" }, state.error),
        h(
          "p",
          null,
          "Please try connecting again."
        ),
        h(
          "button",
          {
            type: "button",
            onClick: () => void retryConnection()
          },
          "Retry Connection"
        )
      );
      break;
  }

  return h(
    "main",
    { className: "feed-container" },
    h(
      "header",
      null,
      h("h1", null, "Data Feed Dashboard"),
      h(
        "p",
        null,
        "Resilient State Machine & Skeleton Loader"
      )
    ),
    content
  );
}

export default DataFeed;
