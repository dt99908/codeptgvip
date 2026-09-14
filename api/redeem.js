export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action, userId, code } = req.body || {};

    // 1. Tra cứu thông tin nhân vật Play Together VNG
    if (action === 'get_info') {
      if (!userId) {
        return res.status(400).json({ success: false, message: 'Thiếu Role ID' });
      }

      // Thử endpoint tra cứu nhân vật chính thức của VNG Webshop
      const shopRes = await fetch('https://shop.vnggames.com/api/v1/role/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Origin': 'https://shop.vnggames.com',
          'Referer': 'https://shop.vnggames.com/vn/game/ptgvn'
        },
        body: JSON.stringify({
          game_code: 'ptgvn',
          account_type: 'role_id',
          role_id: userId
        })
      });

      const responseText = await shopRes.text();
      let shopData;
      try {
        shopData = JSON.parse(responseText);
      } catch (e) {
        // Nếu bị Cloudflare chặn trả về HTML
        return res.status(200).json({
          success: false,
          is_html: true,
          message: 'VNG Shop yêu cầu xác thực Cloudflare trên Server Vercel',
          raw: responseText.substring(0, 100)
        });
      }

      return res.status(200).json(shopData);
    }

    // 2. Nhập Giftcode
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
    return res.status(500).json({ success: false, message: 'Lỗi Server: ' + error.message });
  }
}
