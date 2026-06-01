import casContent from "./public/cas.txt";

const STATIC_FILES = {
  "/cas.txt": casContent,
};

/**
 * Handles static file requests.
 * @param {string} pathname - The normalized request pathname.
 * @returns {Response|null} The Response object if a static file matches, otherwise null.
 */
export function handleStaticRequest(pathname) {
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
  return null;
}
