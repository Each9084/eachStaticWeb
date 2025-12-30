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

        // 建议替换 api/checkin.js 中的 POST 处理部分
        if (req.method === 'POST') {
            const { user, date, text, type, commentId } = req.body;
            let data = await kv.get('checkin_data') || {};
            if (!data[user]) data[user] = {};

            // 1. 获取并强制格式化旧数据 (数据清洗)
            let raw = data[user][date];
            let dayObj = { tasks: [], comments: [] };
            if (raw) {
                try {
                    let p = typeof raw === 'string' ? JSON.parse(raw) : raw;
                    // 兼容逻辑：如果是纯数组，说明是极旧数据
                    if (Array.isArray(p)) dayObj.tasks = p;
                    // 如果是对象，则尝试深度寻找最底层的 tasks
                    else if (p && typeof p === 'object') {
                        let deepTasks = p;
                        while (deepTasks.tasks && !Array.isArray(deepTasks.tasks)) deepTasks = deepTasks.tasks;
                        dayObj.tasks = Array.isArray(deepTasks.tasks) ? deepTasks.tasks : (Array.isArray(p) ? p : []);
                        dayObj.comments = p.comments || [];
                    }
                } catch (e) { dayObj = { tasks: [], comments: [] }; }
            }

            // 2. 根据类型更新
            if (type === 'add_comment') {
                const newC = JSON.parse(text);
                newC.id = 'cmt_' + Date.now();
                dayObj.comments.push(newC);
            } else if (type === 'delete_comment') {
                dayObj.comments = dayObj.comments.filter(c => c.id !== commentId);
            } else {
                // update_tasks：只更新任务，保留评论
                dayObj.tasks = JSON.parse(text);
            }

            // 3. 存储：直接存入清洗后的标准对象字符串
            data[user][date] = JSON.stringify(dayObj);
            await kv.set('checkin_data', data);
            return res.status(200).json({ success: true });
        }
    } catch (error) {
        console.error("KV Runtime Error:", error);
        return res.status(500).json({ error: error.message });
    }
}