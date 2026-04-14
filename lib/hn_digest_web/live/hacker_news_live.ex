defmodule HnDigestWeb.HackerNewsLive do
  use HnDigestWeb, :live_view

  alias HnDigest.HnApi

  # Default search term mirrors the React app's initial useState value
  @default_search "hn:,llm,gpt,claude,gemini,open,fast,tube,github,crunch,reddit,mcp,agent,ai ,developer,cursor,google,software,blog"

  # ── Mount ─────────────────────────────────────────────────────────────
  # Runs twice: once for the static render (connected? = false),
  # once after the WebSocket connects (connected? = true).
  # We only kick off the API fetch after the socket is live.
  @impl true
  def mount(_params, _session, socket) do
    socket =
      socket
      |> assign(:search_term, @default_search)
      |> assign(:min_points, "")
      |> assign(:filters_expanded, false)
      |> assign(:loading, true)
      |> assign(:error, nil)
      |> assign(:stories, [])
      # Persisted sets — populated from localStorage via JS hook on connect
      |> assign(:removed_stories, MapSet.new())
      |> assign(:clicked_links, MapSet.new())

    if connected?(socket), do: send(self(), :fetch_stories)

    {:ok, socket}
  end

  # ── Async fetch (replaces useQuery) ──────────────────────────────────
  @impl true
  def handle_info(:fetch_stories, socket) do
    min_points = effective_min_points(socket.assigns.min_points)

    case HnApi.fetch_stories(min_points) do
      {:ok, stories} ->
        # Schedule a re-fetch in 5 minutes to match React Query staleTime
        Process.send_after(self(), :fetch_stories, 5 * 60 * 1_000)
        {:noreply, assign(socket, stories: stories, loading: false, error: nil)}

      {:error, reason} ->
        {:noreply, assign(socket, error: reason, loading: false)}
    end
  end

  # ── JS Hook: restore localStorage state on connect ───────────────────
  # The RestoreSession hook fires after LiveSocket connects and pushes
  # back whatever was stored in localStorage on the previous visit.
  @impl true
  def handle_event(
        "restore_session",
        %{"removed_stories" => removed, "clicked_links" => clicked},
        socket
      ) do
    socket =
      socket
      |> assign(:removed_stories, MapSet.new(removed))
      |> assign(:clicked_links, MapSet.new(clicked))

    {:noreply, socket}
  end

  # ── Search (replaces useState(searchTerm) + onChange) ────────────────
  def handle_event("search", %{"value" => term}, socket) do
    {:noreply, assign(socket, :search_term, term)}
  end

  # ── Min points (replaces useState(minPoints) + onChange) ─────────────
  def handle_event("set_min_points", %{"value" => val}, socket) do
    # Only re-fetch if the value actually changed and is valid
    old = effective_min_points(socket.assigns.min_points)
    new = effective_min_points(val)

    socket = assign(socket, :min_points, val)

    socket =
      if new != old do
        send(self(), :fetch_stories)
        assign(socket, :loading, true)
      else
        socket
      end

    {:noreply, socket}
  end

  # ── Dismiss story (replaces handleRemoveStory + localStorage) ────────
  def handle_event("dismiss_story", %{"id" => story_id}, socket) do
    removed = prune_map_set(MapSet.put(socket.assigns.removed_stories, story_id))

    socket =
      socket
      |> assign(:removed_stories, removed)
      |> push_event("save_session", %{removed_stories: MapSet.to_list(removed)})

    {:noreply, socket}
  end

  # ── Track link click (replaces handleLinkClick + localStorage) ────────
  def handle_event("track_click", %{"id" => story_id}, socket) do
    clicked = MapSet.put(socket.assigns.clicked_links, story_id)

    socket =
      socket
      |> assign(:clicked_links, clicked)
      |> push_event("save_session", %{clicked_links: MapSet.to_list(clicked)})

    {:noreply, socket}
  end

  # ── Toggle filter panel ───────────────────────────────────────────────
  def handle_event("toggle_filters", _params, socket) do
    {:noreply, update(socket, :filters_expanded, &(!&1))}
  end

  # ── Retry after error ─────────────────────────────────────────────────
  def handle_event("retry", _params, socket) do
    send(self(), :fetch_stories)
    {:noreply, assign(socket, :loading, true)}
  end

  # ── Render ────────────────────────────────────────────────────────────
  @impl true
  def render(assigns) do
    assigns = assign(assigns, :visible_stories, filter_stories(assigns))

    ~H"""
    <%!-- RestoreSession hook fires on mount and pushes localStorage back --%>
    <div id="session-store" phx-hook="RestoreSession">
      <div class="min-h-screen">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <%!-- Editorial Header --%>
          <header class="mb-12 sm:mb-16 animate-fade-up">
            <div class="mono-label mb-4">Weekly Digest</div>
            <h1 class="headline-editorial text-foreground mb-4">
              <span class="header-accent">Tech Intelligence</span>
            </h1>
            <p class="subheadline">
              Curated stories from Hacker News &mdash; <%= effective_min_points(@min_points) %>+ upvotes
            </p>
          </header>

          <%!-- Decorative separator --%>
          <div class="separator-ornament animate-fade-up stagger-2" aria-hidden="true">◆</div>

          <%!-- Filter Controls --%>
          <section class="mb-10 sm:mb-12 animate-fade-up stagger-3" aria-label="Story filters">
            <button
              phx-click="toggle_filters"
              class="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors group"
              aria-expanded={to_string(@filters_expanded)}
              aria-controls="filter-content"
            >
              <div class="flex items-center gap-3">
                <%!-- Sliders icon --%>
                <svg
                  class="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line
                    x1="12"
                    y1="21"
                    x2="12"
                    y2="12"
                  /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line
                    x1="20"
                    y1="12"
                    x2="20"
                    y2="3"
                  /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line
                    x1="17"
                    y1="16"
                    x2="23"
                    y2="16"
                  />
                </svg>
                <span class="font-mono text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  Filters
                </span>
                <%= if @search_term != "" or @min_points != "" do %>
                  <span class="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-mono">
                    Active
                  </span>
                <% end %>
              </div>
              <%= if @filters_expanded do %>
                <svg
                  class="w-4 h-4 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              <% else %>
                <svg
                  class="w-4 h-4 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              <% end %>
            </button>

            <div
              id="filter-content"
              class={[
                "overflow-hidden transition-all duration-300 ease-out",
                if(@filters_expanded, do: "max-h-96 opacity-100 mt-4", else: "max-h-0 opacity-0")
              ]}
            >
              <div class="flex flex-col lg:flex-row gap-4 lg:gap-6 p-4 rounded-lg bg-card/50 border border-border/50">
                <div class="flex-1">
                  <label for="search" class="input-label flex items-center gap-2">
                    <svg
                      class="w-3 h-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    Search Stories
                  </label>
                  <input
                    id="search"
                    type="text"
                    placeholder="Enter keywords, separated by commas..."
                    value={@search_term}
                    class="input-neo"
                    phx-change="search"
                    phx-debounce="300"
                    aria-describedby="search-hint"
                  />
                  <p id="search-hint" class="mt-2 text-xs text-muted-foreground/60 font-mono">
                    Comma-separated terms use OR logic
                  </p>
                </div>

                <div class="w-full lg:w-40">
                  <label for="upvotes" class="input-label flex items-center gap-2">
                    <svg
                      class="w-3 h-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                    </svg>
                    Min Upvotes
                  </label>
                  <input
                    id="upvotes"
                    type="number"
                    placeholder="15"
                    value={@min_points}
                    class="input-neo"
                    min="1"
                    phx-change="set_min_points"
                    phx-debounce="500"
                    aria-describedby="upvotes-hint"
                    name="value"
                  />
                  <p id="upvotes-hint" class="mt-2 text-xs text-muted-foreground/60 font-mono">
                    Filters by popularity
                  </p>
                </div>
              </div>
            </div>
          </section>

          <%!-- Results count --%>
          <%= if not @loading and is_nil(@error) and length(@visible_stories) > 0 do %>
            <div class="mb-6 font-mono text-xs text-muted-foreground animate-fade-in">
              Showing <span class="text-primary font-semibold"><%= length(@visible_stories) %></span>
              stories
            </div>
          <% end %>

          <%!-- Content Area --%>
          <main>
            <%= cond do %>
              <% @loading -> %>
                <.loading_skeleton />
              <% not is_nil(@error) -> %>
                <.error_state message={@error} />
              <% length(@visible_stories) == 0 -> %>
                <.empty_state />
              <% true -> %>
                <div class="story-grid">
                  <%= for {story, index} <- Enum.with_index(@visible_stories) do %>
                    <.story_card
                      story={story}
                      index={index}
                      clicked={MapSet.member?(@clicked_links, story["objectID"])}
                    />
                  <% end %>
                </div>
            <% end %>
          </main>

          <%!-- Footer --%>
          <footer class="mt-16 pt-8 border-t border-border/50 animate-fade-in">
            <div class="flex items-center justify-center gap-4">
              <p class="font-mono text-xs text-muted-foreground/50">
                Powered by
                <a
                  href="https://hn.algolia.com/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-muted-foreground hover:text-primary transition-colors"
                >
                  Algolia HN API
                </a>
              </p>
              <span class="text-border/30">•</span>
              <a
                href="https://github.com/ankitpandey2708/hackernews"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1.5 text-muted-foreground/50 hover:text-primary transition-colors"
                aria-label="View source on GitHub"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </footer>
        </div>
      </div>
    </div>
    """
  end

  # ── Private helpers ───────────────────────────────────────────────────

  # Mirrors the two useMemo calls in the React component.
  # No memoisation needed — Elixir is pure, Phoenix diffs only changed DOM.
  defp filter_stories(assigns) do
    search_terms =
      assigns.search_term
      |> String.split(",")
      |> Enum.map(&String.trim/1)
      |> Enum.map(&String.downcase/1)
      |> Enum.reject(&(&1 == ""))

    assigns.stories
    # Filter out dismissed and clicked (clicked are hidden like in React)
    |> Enum.reject(fn s ->
      MapSet.member?(assigns.removed_stories, s["objectID"]) or
        MapSet.member?(assigns.clicked_links, s["objectID"])
    end)
    # Apply keyword search (comma-separated OR logic)
    |> then(fn stories ->
      if search_terms == [] do
        stories
      else
        Enum.filter(stories, fn story ->
          title = String.downcase(story["title"] || "")
          url = String.downcase(story["url"] || "")
          Enum.any?(search_terms, &(String.contains?(title, &1) or String.contains?(url, &1)))
        end)
      end
    end)
  end

  defp effective_min_points(""), do: 15

  defp effective_min_points(val) when is_binary(val) do
    case Integer.parse(val) do
      {n, _} when n > 0 -> n
      _ -> 15
    end
  end

  defp effective_min_points(val) when is_integer(val) and val > 0, do: val
  defp effective_min_points(_), do: 15

  # Keep the most-recent 400 IDs when the set grows large
  defp prune_map_set(set) do
    if MapSet.size(set) > 500 do
      set |> MapSet.to_list() |> Enum.take(-400) |> MapSet.new()
    else
      set
    end
  end
end
