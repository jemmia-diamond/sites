import { handleStaticRequest } from "./static.js";
import { handleMarkdownRequest } from "./markdown.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    let pathname = url.pathname;

    // Normalize pathname: strip trailing slash if present (except for root '/')
    if (pathname.length > 1 && pathname.endsWith("/")) {
      pathname = pathname.slice(0, -1);
    }

    // Dispatch static file requests (e.g. /cas.txt)
    const staticResponse = handleStaticRequest(pathname);
    if (staticResponse) {
      return staticResponse;
    }

    // Dispatch Markdown conversion requests (e.g. any route ending with .md)
    const markdownResponse = await handleMarkdownRequest(request, url, pathname);
    if (markdownResponse) {
      return markdownResponse;
    }

    // Fallback to origin for standard web traffic
    return fetch(request);
  },
};
