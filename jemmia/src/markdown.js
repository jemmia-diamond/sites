import TurndownService from "turndown";
import { parseHTML } from "linkedom";

/**
 * Checks and handles Markdown (.md) requests by fetching the equivalent HTML and converting it.
 * @param {Request} request - The original fetch request.
 * @param {URL} url - The parsed URL object.
 * @param {string} pathname - The normalized request pathname.
 * @returns {Promise<Response|null>} The Markdown response if the request was handled, otherwise null.
 */
export async function handleMarkdownRequest(request, url, pathname) {
  // Check if the request is for a Markdown version of a route
  if (!pathname.toLowerCase().endsWith(".md")) {
    return null;
  }

  const pathnameWithoutMd = pathname.slice(0, -3);
  
  // Construct the HTML source URL (same path without the .md extension)
  const htmlUrl = new URL(url);
  htmlUrl.pathname = pathnameWithoutMd;

  try {
    // Fetch the original HTML content from the origin
    const htmlResponse = await fetch(htmlUrl.toString(), {
      headers: request.headers,
      method: request.method,
    });

    // If the original response is not OK or not HTML, return it directly
    const contentType = htmlResponse.headers.get("content-type") || "";
    if (!htmlResponse.ok || !contentType.includes("text/html")) {
      return htmlResponse;
    }

    const htmlText = await htmlResponse.text();

    // Parse HTML and convert it to Markdown
    const { document } = parseHTML(htmlText);
    const turndownService = new TurndownService();
    
    // Remove non-content and styling elements to get clean Markdown
    turndownService.remove(["script", "style", "noscript", "iframe", "object", "embed"]);

    const targetElement = document.body || document.documentElement || document;
    const markdown = turndownService.turndown(targetElement);

    return new Response(markdown, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return new Response(`Error converting HTML to Markdown: ${error.message}`, {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
