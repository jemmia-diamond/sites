export default {
  async fetch(request, env) {
    try {
      let response = await env.ASSETS.fetch(request);
      
      // Nếu không tìm thấy file (404), trả về index.html cho các route của SPA
      if (response.status === 404) {
        const url = new URL(request.url);
        url.pathname = '/index.html';
        return await env.ASSETS.fetch(new Request(url, request));
      }
      
      return response;
    } catch (e) {
      // In lỗi ra màn hình thay vì bắn ra 1101 Exception
      return new Response("Lỗi Worker: " + (e.stack || e.message), { status: 500 });
    }
  }
}
