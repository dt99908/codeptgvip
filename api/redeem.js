export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { user_code, coupon_code } = req.body || {};

  if (!user_code || !coupon_code) {
    return res.status(400).json({ message: 'Thiếu Game ID hoặc Mã Code' });
  }

  try {
    // Sử dụng proxy miễn phí AllOrigins
    const targetUrl = 'https://coupon.haegin.kr/api/coupon/use';
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;

    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*'
      },
      body: JSON.stringify({
        user_code: user_code.trim(),
        coupon_code: coupon_code.trim()
      })
    });

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ 
      message: 'Không thể kết nối máy chủ', 
      error: error.message 
    });
  }
}
