import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // 跨域设置，允许你的 Vercel 静态页面调用
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        if (req.method === 'GET') {
            // 获取全部打卡数据
            const data = await kv.get('checkin_data') || {};

            // 如果前端只想要用户名列表，通过 ?type=users 调用
            if (req.query.type === 'users') {
                return res.status(200).json(Object.keys(data));
            }
            return res.status(200).json(data);
        }

        if (req.method === 'POST') {
            const { user, date, text } = req.body;
            if (!user || !date) return res.status(400).json({ error: 'Missing parameters' });

            // 1. 读取当前云端数据
            let data = await kv.get('checkin_data') || {};

            // 2. 更新或创建用户条目
            if (!data[user]) data[user] = {};
            data[user][date] = text; // 直接覆盖，实现任意时间编辑功能

            // 3. 存回 Vercel KV
            await kv.set('checkin_data', data);

            return res.status(200).json({ success: true, message: '同步成功' });
        }
    } catch (error) {
        console.error("KV Error:", error);
        return res.status(500).json({ error: 'Server Error', details: error.message });
    }
}