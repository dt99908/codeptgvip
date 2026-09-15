export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { user_code, coupon_code } = req.body || {};

  if (!user_code || !coupon_code) {
    return res.status(400).json({ message: 'Thiếu Game ID hoặc Mã Code' });
  }

  // Timeout 10 giây để tránh treo nút "Đang xử lý"
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const targetUrl = 'https://coupon.haegin.kr/api/coupon/use';

    // Gọi thẳng, KHÔNG qua proxy (server-to-server không bị CORS chặn)
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        // Giả lập trình duyệt thật — nhiều API dạng này chặn theo Origin/Referer/UA
        'Origin': 'https://coupon.haegin.kr',
        'Referer': 'https://coupon.haegin.kr/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({
        user_code: user_code.trim(),
        coupon_code: coupon_code.trim()
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      // Server không trả JSON hợp lệ (HTML lỗi, chặn bot, đổi endpoint...)
      // Trả kèm "raw" để debug — sau khi xong có thể bỏ field này đi
      return res.status(502).json({
        message: 'Máy chủ game trả về dữ liệu không hợp lệ.',
        status: response.status,
        raw: text.slice(0, 500)
      });
    }

    // Trả nguyên status code từ API gốc, không ép cứng về 200
    return res.status(response.status).json(data);

  } catch (error) {
    clearTimeout(timeoutId);
    const isTimeout = error.name === 'AbortError';
    return res.status(500).json({
      message: isTimeout ? 'Hết thời gian chờ máy chủ phản hồi (Timeout).' : 'Lỗi kết nối máy chủ game.',
      error: error.message
    });
  }
}
