export default {
  async fetch(request, env) {
    try {
      let response = await env.ASSETS.fetch(request);      
      if (response.status === 404) {
        const url = new URL(request.url);
        url.pathname = '/';
        return await env.ASSETS.fetch(new Request(url, request));
      }
      
      return response;
    } catch (e) {
      return new Response("Lỗi Worker: " + (e.stack || e.message), { status: 500 });
    }
  }
}
