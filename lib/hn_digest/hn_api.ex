defmodule HnDigest.HnApi do
  @moduledoc """
  Client for the Algolia Hacker News Search API.
  Mirrors the logic in src/lib/services/hnApi.js.
  """

  @base_url "https://hn.algolia.com/api/v1"

  @doc """
  Fetch top HN stories from the past 7 days above min_points.
  Returns {:ok, [story_map]} or {:error, reason}.

  Each story map has string keys: objectID, title, url, points, created_at.
  """
  def fetch_stories(min_points \\ 15) do
    one_week_ago = DateTime.utc_now() |> DateTime.add(-7, :day) |> DateTime.to_unix()

    params = [
      tags: "story",
      numericFilters: "created_at_i>#{one_week_ago},points>=#{min_points}",
      hitsPerPage: 1000,
      attributesToRetrieve: "objectID,title,url,points,created_at"
    ]

    case Req.get("#{@base_url}/search", params: params) do
      {:ok, %{status: 200, body: %{"hits" => hits}}} ->
        {:ok, deduplicate_and_sort(hits)}

      {:ok, %{status: status}} ->
        {:error, "Algolia API returned #{status}"}

      {:error, reason} ->
        {:error, inspect(reason)}
    end
  end

  @doc "Build the HN item URL for a given objectID (discussion link)."
  def story_url(object_id), do: "https://news.ycombinator.com/item?id=#{object_id}"

  # Mirrors the JS dedup logic: group by URL, keep highest-points version.
  # Discussion-only posts (no url) are kept by objectID key.
  defp deduplicate_and_sort(hits) do
    hits
    |> Enum.reduce(%{}, fn story, acc ->
      key =
        case story["url"] do
          nil -> "discussion_#{story["objectID"]}"
          url -> url
        end

      existing = Map.get(acc, key)

      if is_nil(existing) or story["points"] > existing["points"] do
        Map.put(acc, key, story)
      else
        acc
      end
    end)
    |> Map.values()
    |> Enum.sort_by(& &1["points"], :desc)
  end
end
