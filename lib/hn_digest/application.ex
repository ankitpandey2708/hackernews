defmodule HnDigest.Application do
  use Application

  @impl true
  def start(_type, _args) do
    children = [
      HnDigestWeb.Telemetry,
      {Phoenix.PubSub, name: HnDigest.PubSub},
      HnDigestWeb.Endpoint
    ]

    opts = [strategy: :one_for_one, name: HnDigest.Supervisor]
    Supervisor.start_link(children, opts)
  end

  @impl true
  def config_change(changed, _new, removed) do
    HnDigestWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
