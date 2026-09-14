export default async function handler(req, res) {
  // Cấu hình CORS Header cho phép gọi từ giao diện web
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Chỉ chấp nhận phương thức POST' });
  }

  try {
    const { userId, code } = req.body || {};

    if (!userId || !code) {
      return res.status(400).json({ success: false, message: 'Thiếu userId hoặc code' });
    }

    // Gửi yêu cầu Server-to-Server tới VNG
    const vngResponse = await fetch('https://giftcode.vnggames.com/vn/redeem/ptg', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({
        role_id: userId,
        code: code
      })
    });

    // Lấy nội dung phản hồi dưới dạng text để tránh crash nếu không phải JSON
    const responseText = await vngResponse.text();

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      // Nếu VNG trả về trang HTML/lỗi thay vì JSON
      data = {
        success: false,
        message: 'Phản hồi từ VNG không phải JSON: ' + responseText.substring(0, 150)
      };
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi Vercel Server: ' + error.message });
  }
}
