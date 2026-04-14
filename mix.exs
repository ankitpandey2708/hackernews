defmodule HnDigest.MixProject do
  use Mix.Project

  def project do
    [
      app: :hn_digest,
      version: "0.1.0",
      elixir: "~> 1.16",
      elixirc_paths: elixirc_paths(Mix.env()),
      start_permanent: Mix.env() == :prod,
      aliases: aliases(),
      deps: deps()
    ]
  end

  def application do
    [
      mod: {HnDigest.Application, []},
      extra_applications: [:logger, :runtime_tools]
    ]
  end

  defp elixirc_paths(_), do: ["lib"]

  defp deps do
    [
      {:phoenix, "~> 1.7.14"},
      {:phoenix_html, "~> 4.1"},
      {:phoenix_live_view, "~> 0.20.17"},
      {:phoenix_live_reload, "~> 1.2", only: :dev},
      {:bandit, "~> 1.5"},
      {:req, "~> 0.5"},
      {:jason, "~> 1.4"},
      {:telemetry_metrics, "~> 1.0"},
      {:telemetry_poller, "~> 1.0"},
      {:esbuild, "~> 0.8", runtime: Mix.env() == :dev},
      {:tailwind, "~> 0.2", runtime: Mix.env() == :dev}
    ]
  end

  defp aliases do
    [
      setup: ["deps.get", "assets.setup", "assets.build"],
      "assets.setup": ["tailwind.install --if-missing", "esbuild.install --if-missing"],
      "assets.build": ["tailwind hn_digest", "esbuild hn_digest"],
      "assets.deploy": [
        "tailwind hn_digest --minify",
        "esbuild hn_digest --minify",
        "phx.digest"
      ]
    ]
  end
end
