import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // 跨域处理
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        // 1. 获取所有数据
        if (req.method === 'GET') {
            const data = await kv.get('checkin_data');
            return res.status(200).json(data || {});
        }

        // 2. 写入或修改数据 (POST)
        if (req.method === 'POST') {
            const { user, date, text, type, commentId } = req.body;

            // 基础校验：user 是目标用户（被评论的人或打卡的人）
            if (!user || !date) return res.status(400).json({ error: 'Missing params' });

            let data = await kv.get('checkin_data') || {};
            if (!data[user]) data[user] = {};

            // 获取当天的旧数据并标准化为对象格式 {tasks: [], comments: []}
            let dayData = data[user][date];
            if (!dayData) {
                dayData = { tasks: [], comments: [] };
            } else if (typeof dayData === 'string') {
                try {
                    const parsed = JSON.parse(dayData);
                    dayData = parsed.tasks ? parsed : { tasks: parsed, comments: [] };
                } catch (e) {
                    dayData = { tasks: [], comments: [] };
                }
            }

            // --- 逻辑分支 A: 添加评论 ---
            if (type === 'add_comment') {
                if (!dayData.comments) dayData.comments = [];

                const newComment = JSON.parse(text);
                // 核心修复：后端生成唯一ID，方便删除
                newComment.id = 'cmt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

                dayData.comments.push(newComment);
                data[user][date] = JSON.stringify(dayData);
            }

            // --- 逻辑分支 B: 删除评论 ---
            else if (type === 'delete_comment') {
                if (dayData.comments) {
                    // 根据 ID 过滤掉要删除的评论
                    dayData.comments = dayData.comments.filter(c => c.id !== commentId);
                    data[user][date] = JSON.stringify(dayData);
                }
            }

            // --- 逻辑分支 C: 更新打卡任务 (原逻辑) ---
            else {
                // 如果是更新任务列表，保留原有的评论不被覆盖
                const newTasks = JSON.parse(text);
                dayData.tasks = Array.isArray(newTasks) ? newTasks : [];
                data[user][date] = JSON.stringify(dayData);
            }

            // 将更新后的全量数据回写 KV
            await kv.set('checkin_data', data);
            return res.status(200).json({ success: true });
        }
    } catch (error) {
        console.error("KV Runtime Error:", error);
        return res.status(500).json({ error: error.message });
    }
}