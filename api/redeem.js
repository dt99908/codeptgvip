export default async function handler(req, res) {
  // Cấu hình CORS Header
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action, userId, code } = req.body || {};

    // 1. ACTION: Tra cứu thông tin nhân vật theo Role ID
    if (action === 'get_info') {
      if (!userId) {
        return res.status(400).json({ success: false, message: 'Thiếu Role ID' });
      }

      // Gửi request tra cứu thông tin nhân vật tới VNG
      const infoRes = await fetch(`https://giftcode.vnggames.com/vn/redeem/ptg/get-role-info?role_id=${encodeURIComponent(userId)}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const infoText = await infoRes.text();
      let infoData;
      try {
        infoData = JSON.parse(infoText);
      } catch (e) {
        infoData = { success: false, message: 'Không thể lấy thông tin nhân vật', raw: infoText.substring(0, 100) };
      }

      return res.status(200).json(infoData);
    }

    // 2. ACTION: Nhập Giftcode
    if (!userId || !code) {
      return res.status(400).json({ success: false, message: 'Thiếu userId hoặc code' });
    }

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

    const responseText = await vngResponse.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      data = { success: false, message: 'Phản hồi từ VNG không phải JSON: ' + responseText.substring(0, 100) };
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi Vercel Server: ' + error.message });
  }
}
