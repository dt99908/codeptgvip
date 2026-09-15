export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { user_code, coupon_code } = req.body;

  if (!user_code || !coupon_code) {
    return res.status(400).json({ message: 'Thiếu thông tin' });
  }

  try {
    const response = await fetch('https://coupon.haegin.kr/api/coupon/use', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://coupon.haegin.kr/coupon',
        'Origin': 'https://coupon.haegin.kr'
      },
      body: JSON.stringify({ user_code, coupon_code })
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi kết nối máy chủ' });
  }
}
