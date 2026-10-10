
import { useDataFeed } from "./state-machine";
import "./DataFeed.css";

export default function DataFeed() {
  const { state, loadData, retryConnection } = useDataFeed();

  return (
    <main className="feed-container">
      <header>
        <h1>Data Feed Dashboard</h1>
        <p>Resilient State Machine & Skeleton Loader</p>
      </header>

      {state.status === "IDLE" && (
        <section aria-label="Start data loading">
          <p>Click the button to load your feed.</p>
          <button type="button" onClick={() => void loadData()}>
            Fetch Feed
          </button>
        </section>
      )}

      {state.status === "LOADING" && (
        <section
          aria-label="Loading feed"
          aria-busy="true"
          aria-describedby="loading-message"
        >
          <h2 id="loading-message" role="status">
            Loading feed, please wait...
          </h2>

          <ul className="skeleton-list" aria-hidden="true">
            {[1, 2, 3].map((id) => (
              <li key={id} className="skeleton-item">
                <article>
                  <span className="skeleton-box skeleton-title" />
                  <span className="skeleton-box skeleton-text" />
                  <span className="skeleton-box skeleton-text short" />
                </article>
              </li>
            ))}
          </ul>
        </section>
      )}

      {state.status === "SUCCESS" && (
        <section aria-labelledby="feed-heading">
          <h2 id="feed-heading">Feed Items</h2>
          <p>{state.data.length} items loaded successfully.</p>

          <ul className="feed-list">
            {state.data.map((item) => (
              <li key={item.id}>
                <article className="feed-card">
                  <h3>{item.title}</h3>
                  {item.content && <p>{item.content}</p>}
                </article>
              </li>
            ))}
          </ul>

          <button type="button" onClick={() => void loadData()}>
            Refresh Feed
          </button>
        </section>
      )}

      {state.status === "ERROR" && (
        <section
          className="error-panel"
          aria-labelledby="error-heading"
        >
          <h2 id="error-heading">Unable to load feed</h2>
          <p role="alert">{state.error}</p>
          <p>Please check your connection and try again.</p>

          <button
            type="button"
            onClick={() => void retryConnection()}
          >
            Retry Connection
          </button>
        </section>
      )}
    </main>
  );
}
