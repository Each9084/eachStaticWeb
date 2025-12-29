import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        /* if (req.method === 'GET') {
            const data = await kv.get('checkin_data');
            return res.status(200).json(data || {});
        } */

        // 在 GET 逻辑里临时加入
        if (req.method === 'GET') {
            let data = await kv.get('checkin_data') || {};
            if (data["TestBot"]) {
                delete data["TestBot"]; // 删除这个用户
                await kv.set('checkin_data', data); // 写回数据库
            }
            return res.status(200).json(data);
        }

        if (req.method === 'POST') {
            const { user, date, text } = req.body;
            if (!user || !date) return res.status(400).json({ error: 'Missing params' });

            let data = await kv.get('checkin_data') || {};
            if (!data[user]) data[user] = {};
            data[user][date] = text;

            await kv.set('checkin_data', data);
            return res.status(200).json({ success: true });
        }
    } catch (error) {
        console.error("KV Runtime Error:", error);
        return res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
}