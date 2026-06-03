export default {
  async fetch(request, env) {
    // Nếu bạn muốn bảo vệ website bằng mật khẩu Basic Auth, hãy bỏ comment đoạn code bên dưới:
    /*
    const url = new URL(request.url);
    const authHeader = request.headers.get('Authorization');
    
    // Yêu cầu nhập đúng Username: admin và Password: (lấy từ biến VITE_SITE_PASSWORD trong Infisical)
    if (!authHeader || authHeader !== `Basic ${btoa(`admin:${env.VITE_SITE_PASSWORD}`)}`) {
      return new Response('Unauthorized', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Vui long nhap mat khau de truy cap"' }
      });
    }
    */

    // Trả về giao diện Frontend Vite (dist) tĩnh như bình thường
    return env.ASSETS.fetch(request);
  }
}
