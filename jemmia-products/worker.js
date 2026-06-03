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
      // Đề phòng lỗi 1101 (Worker threw exception)
      const url = new URL(request.url);
      url.pathname = '/index.html';
      return await env.ASSETS.fetch(new Request(url, request));
    }
  }
}
