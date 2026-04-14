defmodule HnDigestWeb.CoreComponents do
  @moduledoc """
  Minimal core component set.
  Only what this app actually uses — no generated kitchen-sink.
  """
  use Phoenix.Component

  @doc "Renders a flash notice paragraph (used by app.html.heex)."
  attr :flash, :map, required: true
  attr :kind, :atom, values: [:info, :error], required: true

  def flash(assigns) do
    msg = Phoenix.Flash.get(assigns.flash, assigns.kind)
    assigns = assign(assigns, :msg, msg)

    ~H"""
    <%= if @msg do %>
      <p
        role="alert"
        class={[
          "fixed top-4 right-4 z-50 px-4 py-3 rounded-lg font-mono text-sm",
          @kind == :info && "bg-accent/10 text-accent border border-accent/20",
          @kind == :error && "bg-destructive/10 text-destructive border border-destructive/20"
        ]}
        phx-click="lv:clear-flash"
        phx-value-key={@kind}
      >
        {@msg}
      </p>
    <% end %>
    """
  end
end
