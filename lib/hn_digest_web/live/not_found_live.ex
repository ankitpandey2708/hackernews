defmodule HnDigestWeb.NotFoundLive do
  use HnDigestWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    {:ok, socket}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <div class="min-h-screen flex items-center justify-center px-6">
      <div class="text-center animate-fade-up">
        <h1 class="font-display text-[clamp(8rem,20vw,14rem)] font-normal italic text-muted-foreground/10 leading-none select-none mb-[-2rem]">
          404
        </h1>

        <div class="relative z-10">
          <p class="mono-label mb-4">Page Not Found</p>

          <h2 class="font-display text-3xl sm:text-4xl italic text-foreground mb-4">
            Lost in the void
          </h2>

          <p class="text-muted-foreground max-w-md mx-auto mb-10 text-[15px] leading-relaxed">
            The page you&apos;re looking for has drifted into the digital ether.
            Perhaps it never existed, or maybe it&apos;s just hiding.
          </p>

          <a href="/" class="btn-primary touch-target inline-flex items-center gap-2">
            <svg
              class="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Return to Stories
          </a>
        </div>

        <div class="mt-16 w-24 h-px bg-gradient-to-r from-transparent via-border to-transparent mx-auto" />
      </div>
    </div>
    """
  end
end
