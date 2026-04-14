// Phoenix LiveView client setup
// Replaces: src/main.jsx, src/App.jsx, src/lib/hooks/useLocalStorage.js

import { Socket } from "phoenix"
import { LiveSocket } from "phoenix_live_view"
import topbar from "../vendor/topbar"

// ── LiveView Hooks ────────────────────────────────────────────────────────────

const Hooks = {}

/**
 * RestoreSession
 *
 * Replaces: useLocalStorage('clickedLinks', {}) + useLocalStorage('removedStories', {})
 *
 * On LiveView mount this hook reads whatever was saved to localStorage on the
 * previous visit and pushes it back to the server so the LiveView can filter
 * stories correctly.  It also listens for "save_session" push_events from the
 * server and writes them back to localStorage so they survive page reloads.
 */
Hooks.RestoreSession = {
  mounted() {
    // Push saved state to server on initial connect
    const removed = this._read("removed_stories")
    const clicked = this._read("clicked_links")

    this.pushEvent("restore_session", {
      removed_stories: removed,
      clicked_links:   clicked,
    })

    // Listen for the server asking us to persist updated sets
    this.handleEvent("save_session", (data) => {
      if (data.removed_stories !== undefined) {
        this._write("removed_stories", data.removed_stories)
      }
      if (data.clicked_links !== undefined) {
        this._write("clicked_links", data.clicked_links)
      }
    })
  },

  _read(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "[]")
    } catch (_) {
      return []
    }
  },

  _write(key, value) {
    try {
      // Prune to 500 entries max — mirrors the server-side prune_map_set/1
      const pruned = Array.isArray(value) && value.length > 500
        ? value.slice(-400)
        : value
      localStorage.setItem(key, JSON.stringify(pruned))
    } catch (e) {
      // QuotaExceededError — emergency: clear the key entirely
      if (e.name === "QuotaExceededError") {
        localStorage.removeItem(key)
      }
    }
  }
}

// ── Progress bar ──────────────────────────────────────────────────────────────

topbar.config({ barColors: { 0: "#FF6B35" }, shadowColor: "rgba(0, 0, 0, .3)" })

window.addEventListener("phx:page-loading-start", _info => topbar.show(300))
window.addEventListener("phx:page-loading-stop",  _info => topbar.hide())

// ── LiveSocket ────────────────────────────────────────────────────────────────

const csrfToken = document
  .querySelector("meta[name='csrf-token']")
  .getAttribute("content")

const liveSocket = new LiveSocket("/live", Socket, {
  hooks: Hooks,
  longPollFallbackMs: 2500,
  params: { _csrf_token: csrfToken },
})

liveSocket.connect()

// Expose for debugging in browser console
window.liveSocket = liveSocket
