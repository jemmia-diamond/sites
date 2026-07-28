import casContent from "./public/cas.txt";
import homeContent from "./public/home.md";

const STATIC_FILES = {
  "/cas.txt": {
    content: casContent,
    contentType: "text/plain; charset=utf-8",
  },
  "/jemmia-diamond.md": {
    content: homeContent,
    contentType: "text/markdown; charset=utf-8",
  },
};

/**
 * Handles static file requests.
 * @param {string} pathname - The normalized request pathname.
 * @returns {Response|null} The Response object if a static file matches, otherwise null.
 */
export function handleStaticRequest(pathname) {
  if (Object.prototype.hasOwnProperty.call(STATIC_FILES, pathname)) {
    const file = STATIC_FILES[pathname];
    return new Response(file.content, {
      status: 200,
      headers: {
        "Content-Type": file.contentType,
        "Cache-Control": "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }
  return null;
}
