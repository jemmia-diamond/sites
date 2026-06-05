import { handleStaticRequest } from "./static.js";
import { handleMarkdownRequest } from "./markdown.js";
import { logVisitor } from "./logger.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    let pathname = url.pathname;

    // Normalize pathname: strip trailing slash if present (except for root '/')
    if (pathname.length > 1 && pathname.endsWith("/")) {
      pathname = pathname.slice(0, -1);
    }

    let response;
    try {
      // Dispatch static file requests (e.g. /cas.txt)
      const staticResponse = handleStaticRequest(pathname);
      if (staticResponse) {
        response = staticResponse;
        return response;
      }

      // Dispatch Markdown conversion requests (e.g. any route ending with .md)
      const markdownResponse = await handleMarkdownRequest(request, url, pathname);
      if (markdownResponse) {
        response = markdownResponse;
        return response;
      }

      // Fallback to origin for standard web traffic
      response = await fetch(request);
      return response;
    } catch (error) {
      return new Response(`Internal Server Error: ${error.message}`, {
        status: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    } finally {
      logVisitor(request, env, ctx);
    }
  },
};
