export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { user_code, coupon_code } = req.body || {};

  if (!user_code || !coupon_code) {
    return res.status(400).json({ message: 'Thiếu Game ID hoặc Mã Code' });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const targetUrl = 'https://coupon.haegin.kr/api/coupon/use';

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*'
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
      // Server trả về không phải JSON (VD: HTML lỗi, chặn bot...)
      return res.status(502).json({
        message: 'Máy chủ game trả về dữ liệu không hợp lệ.',
        raw: text.slice(0, 300)
      });
    }

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
