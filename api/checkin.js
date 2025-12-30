import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        if (req.method === 'GET') {
            const data = await kv.get('checkin_data');
            return res.status(200).json(data || {});
        }

        // 临时的删除逻辑
        /* if (req.method === 'GET') {
            let data = await kv.get('checkin_data') || {};
            if (data["TestBot"]) {
                delete data["TestBot"]; // 删除这个用户
                await kv.set('checkin_data', data); // 写回数据库
            }
            return res.status(200).json(data);
        } */

        // api/checkin.js 局部修改建议
        if (req.method === 'POST') {
            const { user, date, text, type } = req.body; // 增加 type 辨别是打卡还是评论
            let data = await kv.get('checkin_data') || {};
            if (!data[user]) data[user] = {};

            if (type === 'add_comment') {
                // 处理评论逻辑
                let dayData = data[user][date];
                // 兼容旧数据结构：如果原本是字符串数组，则转换为新对象格式
                if (typeof dayData === 'string' || Array.isArray(dayData)) {
                    dayData = { tasks: typeof dayData === 'string' ? JSON.parse(dayData) : dayData, comments: [] };
                }
                if (!dayData.comments) dayData.comments = [];

                // 解析传入的评论内容
                const newComment = JSON.parse(text);
                dayData.comments.push(newComment);
                data[user][date] = JSON.stringify(dayData);
            } else {
                // 原有的打卡逻辑：我们也存成新格式
                let existingComments = [];
                try {
                    const old = JSON.parse(data[user][date]);
                    if (old.comments) existingComments = old.comments;
                } catch (e) { }

                data[user][date] = JSON.stringify({
                    tasks: JSON.parse(text),
                    comments: existingComments
                });
            }
            await kv.set('checkin_data', data);
            return res.status(200).json({ success: true });
        }
    } catch (error) {
        console.error("KV Runtime Error:", error);
        return res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
}