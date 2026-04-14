defmodule HnDigestWeb.Router do
  use HnDigestWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, html: {HnDigestWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  scope "/", HnDigestWeb do
    pipe_through :browser

    live "/", HackerNewsLive, :index
  end

  # Catch-all — must be last
  scope "/", HnDigestWeb do
    pipe_through :browser

    live "/*path", NotFoundLive, :index
  end
end
