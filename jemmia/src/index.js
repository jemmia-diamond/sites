/**
 * jemmia-config - Cloudflare Worker
 * Handles authoritative static files like cas.txt and robots.txt
 */

import casContent from "./assets/cas.txt";

const STATIC_FILES = {
  "/cas.txt": casContent,
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (Object.prototype.hasOwnProperty.call(STATIC_FILES, pathname)) {
      return new Response(STATIC_FILES[pathname], {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    // Fallback to origin
    return fetch(request);
  },
};
