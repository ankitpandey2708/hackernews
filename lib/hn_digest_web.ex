defmodule HnDigestWeb do
  @moduledoc """
  Entrypoint for defining the web interface.

  `use HnDigestWeb, :live_view` imports all helpers needed in a LiveView.
  `use HnDigestWeb, :html`       is used in component modules.
  """

  def static_paths, do: ~w(assets fonts images favicon.ico robots.txt)

  def router do
    quote do
      use Phoenix.Router, helpers: false
      import Plug.Conn
      import Phoenix.Controller
      import Phoenix.LiveView.Router
    end
  end

  def channel do
    quote do
      use Phoenix.Channel
    end
  end

  def live_view do
    quote do
      use Phoenix.LiveView,
        layout: {HnDigestWeb.Layouts, :app}

      unquote(html_helpers())
    end
  end

  def live_component do
    quote do
      use Phoenix.LiveComponent
      unquote(html_helpers())
    end
  end

  def html do
    quote do
      use Phoenix.Component
      import Phoenix.Controller, only: [get_csrf_token: 0]
      unquote(html_helpers())
    end
  end

  def verified_routes do
    quote do
      use Phoenix.VerifiedRoutes,
        endpoint: HnDigestWeb.Endpoint,
        router: HnDigestWeb.Router,
        statics: HnDigestWeb.static_paths()
    end
  end

  defp html_helpers do
    quote do
      import Phoenix.HTML
      import HnDigestWeb.CoreComponents
      import HnDigestWeb.StoryComponents
      alias Phoenix.LiveView.JS

      # ~p sigil for verified route generation
      use Phoenix.VerifiedRoutes,
        endpoint: HnDigestWeb.Endpoint,
        router: HnDigestWeb.Router,
        statics: HnDigestWeb.static_paths()
    end
  end

  defmacro __using__(which) when is_atom(which) do
    apply(__MODULE__, which, [])
  end
end
