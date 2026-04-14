import Config

config :hn_digest, HnDigestWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4000],
  check_origin: false,
  code_reloader: true,
  debug_errors: true,
  secret_key_base:
    "dev_secret_key_base_at_least_64_chars_long_for_development_only_replace_in_prod",
  watchers: [
    esbuild: {Esbuild, :install_and_run, [:hn_digest, ~w(--sourcemap=inline --watch)]},
    tailwind: {Tailwind, :install_and_run, [:hn_digest, ~w(--watch)]}
  ]

config :hn_digest, HnDigestWeb.Endpoint,
  live_reload: [
    patterns: [
      ~r"priv/static/(?!uploads/).*(js|css|png|jpeg|jpg|gif|svg)$",
      ~r"priv/gettext/.*(po)$",
      ~r"lib/hn_digest_web/(controllers|live|components|layouts)/.*(ex|heex)$"
    ]
  ]

config :logger, :console, format: "[$level] $message\n"
config :phoenix, :stacktrace_depth, 20
config :phoenix, :plug_init_mode, :runtime
config :phoenix_live_view, :debug_heex_annotations, true
