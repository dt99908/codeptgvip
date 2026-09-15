export default async function handler(req, res) {
  // Chỉ chấp nhận method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { user_code, coupon_code } = req.body || {};

  if (!user_code || !coupon_code) {
    return res.status(400).json({ message: 'Thiếu Game ID hoặc Mã Code' });
  }

  try {
    const response = await fetch('https://coupon.haegin.kr/api/coupon/use', {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
        'Content-Type': 'application/json;charset=UTF-8',
        'Origin': 'https://coupon.haegin.kr',
        'Referer': 'https://coupon.haegin.kr/coupon',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Sec-Ch-Ua': '"Chromium";v="128", "Not=A?Brand";v="24", "Google Chrome";v="128"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin'
      },
      body: JSON.stringify({
        user_code: user_code.trim(),
        coupon_code: coupon_code.trim()
      })
    });

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    // Trả về chi tiết lỗi để dễ kiểm tra
    return res.status(500).json({ 
      message: 'Không thể kết nối đến máy chủ Haegin',
      error_detail: error.message 
    });
  }
}
