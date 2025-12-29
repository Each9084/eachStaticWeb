import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // 跨域设置（如果是静态页面跨域调用）
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'GET') {
            // 获取所有用户的打卡数据
            const data = await kv.get('checkin_data');
            return res.status(200).json(data || {});
        }

        if (req.method === 'POST') {
            const { user, date, text } = req.body;

            // 1. 读取现有数据
            let data = await kv.get('checkin_data') || {};

            // 2. 更新对应用户和日期的数据
            if (!data[user]) data[user] = {};
            data[user][date] = text;

            // 3. 写回 Redis
            await kv.set('checkin_data', data);

            return res.status(200).json({ success: true, message: '同步成功' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}