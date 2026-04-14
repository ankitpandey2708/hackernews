defmodule HnDigestWeb.StoryComponents do
  @moduledoc """
  Phoenix function components that replace the React sub-components
  in src/pages/HackerNews.jsx.
  """
  use Phoenix.Component

  alias HnDigest.HnApi

  # ── StoryCard ──────────────────────────────────────────────────────────
  # Mirrors: const StoryCard = React.memo(({ story, onRemove, onLinkClick, ... }))
  attr :story, :map, required: true
  attr :index, :integer, default: 0
  attr :clicked, :boolean, default: false

  def story_card(assigns) do
    has_url = not is_nil(assigns.story["url"]) and assigns.story["url"] != ""

    story_link =
      if has_url, do: assigns.story["url"], else: HnApi.story_url(assigns.story["objectID"])

    assigns =
      assigns
      |> assign(:has_url, has_url)
      |> assign(:story_link, story_link)
      |> assign(:stagger, stagger_class(assigns.index))
      |> assign(:formatted_date, format_date(assigns.story["created_at"]))

    ~H"""
    <article
      class={"story-card group animate-slide-up #{@stagger}"}
      role="article"
      aria-label={@story["title"]}
    >
      <div class="story-card-accent" aria-hidden="true" />

      <%!-- Dismiss button --%>
      <button
        class="btn-dismiss touch-target"
        phx-click="dismiss_story"
        phx-value-id={@story["objectID"]}
        aria-label="Remove story"
      >
        <%!-- X icon --%>
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div class="pr-10">
        <div class="flex items-start gap-3 mb-3">
          <%!-- Type badge: external article vs discussion --%>
          <div
            class={"story-type-badge flex-shrink-0 mt-0.5 #{if @has_url, do: "external", else: "discussion"}"}
            title={if @has_url, do: "External article", else: "Discussion thread"}
          >
            <%= if @has_url do %>
              <%!-- ExternalLink icon --%>
              <svg
                class="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line
                  x1="10"
                  y1="14"
                  x2="21"
                  y2="3"
                />
              </svg>
            <% else %>
              <%!-- MessageSquare icon --%>
              <svg
                class="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            <% end %>
          </div>

          <%!-- Story title --%>
          <h2 class="flex-1 min-w-0">
            <a
              href={@story_link}
              target="_blank"
              rel="noopener noreferrer"
              class={"story-title #{if @clicked, do: "story-title-visited", else: ""}"}
              phx-click={if @has_url, do: "track_click", else: nil}
              phx-value-id={@story["objectID"]}
            >
              <%= @story["title"] %>
            </a>
          </h2>
        </div>

        <%!-- Meta: points + date --%>
        <div class="story-meta ml-10">
          <span class="story-points">
            <%!-- TrendingUp icon --%>
            <svg
              class="w-3 h-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
            </svg>
            <%= @story["points"] %>
          </span>

          <span class="text-border/30" aria-hidden="true">•</span>

          <a
            href={HnApi.story_url(@story["objectID"])}
            target="_blank"
            rel="noopener noreferrer"
            class="story-date hover:text-foreground transition-colors"
            title="View on Hacker News"
          >
            <%= @formatted_date %>
          </a>
        </div>
      </div>
    </article>
    """
  end

  # ── LoadingSkeleton ────────────────────────────────────────────────────
  # Mirrors: const LoadingSkeleton = () => (...)
  def loading_skeleton(assigns) do
    ~H"""
    <div class="story-grid">
      <%= for index <- 0..8 do %>
        <div class={"story-card animate-fade-in stagger-#{index + 1}"}>
          <div class="flex items-start gap-3 mb-3">
            <div class="skeleton w-7 h-7 rounded-md flex-shrink-0" />
            <div class="flex-1 space-y-2">
              <div class="skeleton h-4 w-full rounded" />
              <div class="skeleton h-4 w-4/5 rounded" />
            </div>
          </div>
          <div class="ml-10 flex items-center gap-3">
            <div class="skeleton h-5 w-14 rounded-full" />
            <div class="skeleton h-3 w-2 rounded-full" />
            <div class="skeleton h-3 w-20 rounded" />
          </div>
        </div>
      <% end %>
    </div>
    """
  end

  # ── ErrorState ─────────────────────────────────────────────────────────
  # Mirrors: const ErrorState = ({ error, onRetry, isRetrying }) => (...)
  attr :message, :string, required: true

  def error_state(assigns) do
    ~H"""
    <div class="empty-state animate-fade-up">
      <div class="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6">
        <svg
          class="w-8 h-8 text-destructive"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M23 4v6h-6" /><path d="M1 20v-6h6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
      </div>
      <h2 class="empty-state-title">Connection Lost</h2>
      <p class="empty-state-description mb-8">
        <%= @message || "Unable to fetch stories. Please check your connection and try again." %>
      </p>
      <button phx-click="retry" class="btn-primary touch-target">
        Try Again
      </button>
    </div>
    """
  end

  # ── EmptyState ─────────────────────────────────────────────────────────
  # Mirrors: const EmptyState = () => (...)
  def empty_state(assigns) do
    ~H"""
    <div class="empty-state animate-fade-up">
      <div class="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
        <svg
          class="w-8 h-8 text-muted-foreground/50"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        </svg>
      </div>
      <h2 class="empty-state-title">No Stories Found</h2>
      <p class="empty-state-description">
        Adjust your search filters or lower the minimum upvotes threshold to discover more content.
      </p>
    </div>
    """
  end

  # ── Helpers ────────────────────────────────────────────────────────────

  defp stagger_class(index) when index < 12, do: "stagger-#{index + 1}"
  defp stagger_class(_), do: ""

  defp format_date(nil), do: ""

  defp format_date(iso) do
    case DateTime.from_iso8601(iso) do
      {:ok, dt, _} -> Calendar.strftime(dt, "%b %-d, %Y")
      _ -> iso
    end
  end
end
